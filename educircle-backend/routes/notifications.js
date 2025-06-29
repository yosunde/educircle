const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

// GET /api/notifications - Kullanıcının bildirimlerini getir
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT id, type, message, link, is_read, created_at
      FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bildirimler getirilemedi' 
    });
  }
});

// POST /api/notifications - Yeni bildirim ekle
router.post('/', auth, async (req, res) => {
  try {
    const { user_id, type, message, link } = req.body;
    
    // Validation
    if (!user_id || !type || !message) {
      return res.status(400).json({
        success: false,
        error: 'user_id, type ve message alanları zorunludur'
      });
    }
    
    // Öğretmen kontrolü (sadece öğretmenler bildirim gönderebilir)
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Sadece öğretmenler bildirim gönderebilir'
      });
    }
    
    const query = `
      INSERT INTO notifications (user_id, type, message, link)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, message, link, is_read, created_at
    `;
    
    const result = await pool.query(query, [user_id, type, message, link]);
    
    res.status(201).json({
      success: true,
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Bildirim eklenirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bildirim eklenemedi' 
    });
  }
});

// PUT /api/notifications/:id/read - Bildirimi okundu olarak işaretle
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Bildirimin kullanıcıya ait olduğunu kontrol et
    const checkQuery = `
      SELECT id FROM notifications 
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı'
      });
    }
    
    // Bildirimi okundu olarak işaretle
    const updateQuery = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING id, type, message, link, is_read, created_at
    `;
    
    const result = await pool.query(updateQuery, [id, userId]);
    
    res.json({
      success: true,
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Bildirim güncellenirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bildirim güncellenemedi' 
    });
  }
});

// DELETE /api/notifications/:id - Bildirimi sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Bildirimin kullanıcıya ait olduğunu kontrol et
    const checkQuery = `
      SELECT id FROM notifications 
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bildirim bulunamadı'
      });
    }
    
    // Bildirimi sil
    await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, userId]);
    
    res.json({
      success: true,
      message: 'Bildirim silindi'
    });
  } catch (error) {
    console.error('Bildirim silinirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bildirim silinemedi' 
    });
  }
});

// PUT /api/notifications/read-all - Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
    `;
    
    await pool.query(query, [userId]);
    
    res.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Bildirimler güncellenirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Bildirimler güncellenemedi' 
    });
  }
});

// GET /api/notifications/unread-count - Okunmamış bildirim sayısını getir
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) as count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      unreadCount: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı getirilirken hata:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Okunmamış bildirim sayısı getirilemedi' 
    });
  }
});

module.exports = router; 