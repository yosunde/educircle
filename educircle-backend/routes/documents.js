const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

// Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Materyal ekle (dosya veya link)
router.post(
  '/:groupId/documents',
  auth,
  upload.single('file'), // Dosya varsa
  async (req, res) => {
    const { groupId } = req.params;
    const { description, file_type, github_link } = req.body;
    const uploader_id = req.user.id;

    // 1. Kullanıcı bu grubun üyesi mi? (güvenlik)
    const memberCheck = await pool.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND student_id = $2`,
      [groupId, uploader_id]
    );
    if (memberCheck.rowCount === 0 && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Bu gruba materyal ekleyemezsiniz.' });
    }

    // 2. Dosya mı, link mi?
    let file_name, file_path, file_size_kb, type;
    if (github_link) {
      // Sadece link ekleniyor
      file_name = 'GitHub Link';
      file_path = github_link;
      type = 'github_link';
      file_size_kb = null;
    } else if (req.file) {
      // Dosya yükleniyor
      file_name = req.file.originalname;
      file_path = req.file.path.replace(/\\/g, '/'); // Windows için
      type = file_type || path.extname(req.file.originalname).substring(1);
      file_size_kb = Math.round(req.file.size / 1024);
    } else {
      return res.status(400).json({ message: 'Dosya veya link gerekli.' });
    }

    // 3. Kaydet
    const result = await pool.query(
      `INSERT INTO documents (group_id, uploader_id, file_name, file_path, file_type, file_size_kb, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [groupId, uploader_id, file_name, file_path, type, file_size_kb, description]
    );
    res.status(201).json(result.rows[0]);
  }
);

// GET /api/groups/:groupId/documents
router.get('/:groupId/documents', auth, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Kullanıcı grup üyesi mi veya öğretmen mi?
  const isMember = await pool.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND student_id = $2`,
    [groupId, userId]
  );
  if (isMember.rowCount === 0 && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Bu grubun materyallerini göremezsiniz.' });
  }

  const result = await pool.query(
    `SELECT * FROM documents WHERE group_id = $1 ORDER BY uploaded_at DESC`,
    [groupId]
  );
  res.json(result.rows);
});

// Belge silme
router.delete('/groups/:groupId/documents/:documentId', auth, async (req, res) => {
  const { groupId, documentId } = req.params;
  try {
    await pool.query('DELETE FROM documents WHERE id = $1 AND group_id = $2', [documentId, groupId]);
    res.json({ message: 'Belge silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Belge silinemedi.' });
  }
});

// PUT /api/groups/:groupId/documents/:documentId/grade - Belgeye not ver
router.put('/:groupId/documents/:documentId/grade', auth, async (req, res) => {
  try {
    const { groupId, documentId } = req.params;
    const { teacher_grade, teacher_notes } = req.body;
    const teacherId = req.user.id;

    // Öğretmen kontrolü
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Sadece öğretmenler not verebilir'
      });
    }

    // Belgeyi güncelle
    const updateQuery = `
      UPDATE documents 
      SET teacher_grade = $1, teacher_notes = $2, graded_by_teacher_id = $3, graded_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND group_id = $5
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [teacher_grade, teacher_notes, teacherId, documentId, groupId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Belge bulunamadı'
      });
    }

    // Belgeyi yükleyen kullanıcıya bildirim gönder
    const document = result.rows[0];
    
    // Grup üyelerine bildirim gönder
    const groupMembersQuery = `
      SELECT DISTINCT gm.student_id 
      FROM group_members gm 
      WHERE gm.group_id = $1
    `;
    
    const membersResult = await pool.query(groupMembersQuery, [groupId]);
    
    // Her üyeye bildirim gönder
    for (const member of membersResult.rows) {
      const notificationQuery = `
        INSERT INTO notifications (user_id, type, message, link)
        VALUES ($1, $2, $3, $4)
      `;
      
      const message = `"${document.file_name}" dosyanıza ${teacher_grade}/100 puanı verildi.`;
      const link = `/groups/${groupId}/documents`;
      
      await pool.query(notificationQuery, [
        member.student_id, 
        'grade', 
        message, 
        link
      ]);
    }

    res.json({
      success: true,
      document: result.rows[0],
      message: 'Not başarıyla verildi ve bildirimler gönderildi'
    });
  } catch (error) {
    console.error('Not verilirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Not verilemedi' 
    });
  }
});

module.exports = router;