const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* ------------------ ÖĞRETMEN ENDPOINTLERİ ------------------ */

// 1. Öğretmen: Bir projenin tüm gruplarını listele
router.get('/teacher/project/:projectId', auth, authorize('teacher'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const teacherId = req.user.id;
    // Proje gerçekten bu öğretmene mi ait?
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND teacher_id = $2',
      [projectId, teacherId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu projeye erişim yetkiniz yok.' });
    }
    // Grupları getir
    const result = await pool.query(
      `SELECT 
  g.id, 
  g.name, 
  g.group_code, 
  g.description, 
  g.created_at, 
  g.updated_at,
  d.teacher_grade,
  d.teacher_notes
FROM groups g
LEFT JOIN documents d ON d.group_id = g.id
WHERE g.project_id = $1
ORDER BY g.created_at ASC`,
      [projectId]
    );
    res.json({ groups: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Öğretmen: Bir grubun üyelerini listele
router.get('/teacher/:groupId/members', auth, authorize('teacher'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const project = await pool.query(
      `SELECT p.teacher_id FROM groups g JOIN projects p ON g.project_id = p.id WHERE g.id = $1`,
      [groupId]
    );
    if (project.rows.length === 0 || project.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu grubun üyelerini görme yetkiniz yok.' });
    }
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.school_number, u.email
       FROM group_members gm
       JOIN users u ON gm.student_id = u.id
       WHERE gm.group_id = $1`,
      [groupId]
    );
    res.json({ members: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Öğretmen: Grup notlandırma ve kapama
router.put('/teacher/:groupId/grade', auth, authorize('teacher'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { teacher_grade, teacher_notes, close_group } = req.body;
    const project = await pool.query(
      `SELECT p.teacher_id FROM groups g JOIN projects p ON g.project_id = p.id WHERE g.id = $1`,
      [groupId]
    );
    if (project.rows.length === 0 || project.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu gruba not verme yetkiniz yok.' });
    }
    await pool.query(
      `UPDATE documents SET teacher_grade = $1, teacher_notes = $2, graded_by_teacher_id = $3, graded_at = NOW()
       WHERE group_id = $4`,
      [teacher_grade, teacher_notes, req.user.id, groupId]
    );
    if (close_group) {
      await pool.query(
        `UPDATE groups SET is_active = FALSE, updated_at = NOW() WHERE id = $1`,
        [groupId]
      );
    }

    // --- Bildirim ekle ---
    const membersResult = await pool.query(
      `SELECT student_id FROM group_members WHERE group_id = $1`,
      [groupId]
    );
    const memberIds = membersResult.rows.map(row => row.student_id);
    const message = 'Grubunuza öğretmen tarafından not verildi!';
    const link = `/groups/${groupId}/student-detail`;
    for (const studentId of memberIds) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, link)
         VALUES ($1, 'grade', $2, $3)`,
        [studentId, message, link]
      );
    }
    res.json({ message: 'Notlandırma ve kapatma işlemi başarılı.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Öğretmen: Sahip olduğu tüm projelerdeki tüm grupları listele
router.get('/teacher/all', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await pool.query(
      `SELECT 
        g.id as group_id,
        g.name as group_name,
        g.group_code,
        g.description as group_description,
        g.created_at as group_created_at,
        g.updated_at as group_updated_at,
        g.project_id,
        p.name as project_name,
        p.description as project_description,
        p.project_code,
        p.due_date,
        p.is_active as project_is_active,
        c.id as course_id,
        c.name as course_name,
        c.course_code,
        d.teacher_grade,
        d.teacher_notes
      FROM groups g
      JOIN projects p ON g.project_id = p.id
      JOIN courses c ON p.course_id = c.id
      LEFT JOIN documents d ON d.group_id = g.id
      WHERE p.teacher_id = $1
      ORDER BY g.created_at ASC` ,
      [teacherId]
    );
    res.json({ groups: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ------------------ ÖĞRENCİ ENDPOINTLERİ ------------------ */

// 1. Öğrenci: Bir projenin tüm gruplarını listele
router.get('/student/project/:projectId', auth, authorize('student'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;
    const projectCheck = await pool.query(
      'SELECT id FROM student_projects WHERE project_id = $1 AND student_id = $2',
      [projectId, studentId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu projenin gruplarını görme yetkiniz yok.' });
    }
    const result = await pool.query(
      `SELECT 
      g.id, 
      g.name, 
      g.group_code, 
      g.description, 
      g.created_at, 
      g.updated_at,
      g.creator_id,
      EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = g.id AND gm.student_id = $2
      ) AS joined,
      d.teacher_grade,
      d.teacher_notes
   FROM groups g
   LEFT JOIN documents d ON d.group_id = g.id
   WHERE g.project_id = $1
   ORDER BY g.created_at ASC`,
  [projectId, studentId]
    );
    res.json({ groups: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Öğrenci: Gruba katıl
router.post('/student/:groupId/join', auth, authorize('student'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const studentId = req.user.id;
    const project = await pool.query(
      `SELECT g.project_id FROM groups g WHERE g.id = $1`,
      [groupId]
    );
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Grup bulunamadı.' });
    }
    const projectId = project.rows[0].project_id;
    const projectCheck = await pool.query(
      'SELECT id FROM student_projects WHERE project_id = $1 AND student_id = $2',
      [projectId, studentId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu gruba katılmak için önce projeye kayıt olmalısınız.' });
    }
    const already = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND student_id = $2',
      [groupId, studentId]
    );
    if (already.rows.length > 0) {
      return res.status(400).json({ error: 'Bu gruptasınız.' });
    }
    await pool.query(
      'INSERT INTO group_members (group_id, student_id) VALUES ($1, $2)',
      [groupId, studentId]
    );
    res.status(201).json({ message: 'Gruba başarıyla katıldınız.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Öğrenci: Yeni grup oluştur
router.post('/student/project/:projectId', auth, authorize('student'), [
  body('name').notEmpty().withMessage('Grup adı zorunlu')
], async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const studentId = req.user.id;
    const projectCheck = await pool.query(
      'SELECT id FROM student_projects WHERE project_id = $1 AND student_id = $2',
      [projectId, studentId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu projede grup oluşturma yetkiniz yok.' });
    }
    const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await pool.query(
      `INSERT INTO groups (project_id, creator_id, name, group_code, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, group_code, description, created_at, updated_at`,
      [projectId, studentId, name, groupCode, description || '']
    );
    await pool.query(
      'INSERT INTO group_members (group_id, student_id) VALUES ($1, $2)',
      [result.rows[0].id, studentId]
    );

    // Proje öğrencilerine yeni grup bildirimi gönder
    const studentsQuery = `
      SELECT sp.student_id 
      FROM student_projects sp 
      WHERE sp.project_id = $1 AND sp.student_id != $2
    `;
    const studentsResult = await pool.query(studentsQuery, [projectId, studentId]);
    
    for (const student of studentsResult.rows) {
      const notificationQuery = `
        INSERT INTO notifications (user_id, type, message, link)
        VALUES ($1, $2, $3, $4)
      `;
      
      const message = `Yeni grup oluşturuldu: "${name}" - Katılmak için kod: ${groupCode}`;
      const link = `/groups/join`;
      
      await pool.query(notificationQuery, [
        student.student_id, 
        'announcement', 
        message, 
        link
      ]);
    }

    res.status(201).json({ message: 'Grup başarıyla oluşturuldu.', group: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Öğrenci: Üye olduğu tüm grupları listele
router.get('/student/all', auth, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await pool.query(
      `SELECT 
        g.id as group_id,
        g.name as group_name,
        g.group_code,
        g.description as group_description,
        g.created_at as group_created_at,
        g.updated_at as group_updated_at,
        g.project_id,
        p.name as project_name,
        p.description as project_description,
        p.project_code,
        p.due_date,
        p.is_active as project_is_active,
        c.id as course_id,
        c.name as course_name,
        c.course_code,
        d.teacher_grade,
        d.teacher_notes
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      JOIN projects p ON g.project_id = p.id
      JOIN courses c ON p.course_id = c.id
      LEFT JOIN documents d ON d.group_id = g.id
      WHERE gm.student_id = $1
      ORDER BY g.created_at ASC`,
      [studentId]
    );
    res.json({ groups: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Herkes (öğrenci veya öğretmen) gruba üyeyse görebilsin:
router.get('/:groupId/members', auth, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Kullanıcı grup üyesi mi veya öğretmen mi?
  const isMember = await pool.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND student_id = $2`,
    [groupId, userId]
  );
  if (isMember.rowCount === 0 && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Bu grubun üyelerini görme yetkiniz yok.' });
  }

  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.school_number, u.email
     FROM group_members gm
     JOIN users u ON gm.student_id = u.id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  res.json({ members: result.rows });
});
module.exports = router;
