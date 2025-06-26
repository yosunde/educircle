const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Öğretmenin kendi kurslarını listele
router.get('/teacher', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await pool.query(
      `SELECT id, name, description, course_code, is_active, created_at, updated_at
       FROM courses
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Teacher courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğretmen yeni kurs eklesin
router.post('/teacher', auth, authorize('teacher'), [
  body('name').notEmpty().withMessage('Course name is required'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description } = req.body;
    const teacherId = req.user.id;
    // course_code otomatik üret
    const courseCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await pool.query(
      `INSERT INTO courses (teacher_id, name, description, course_code)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, course_code, is_active, created_at, updated_at`,
      [teacherId, name, description || '', courseCode]
    );
    res.status(201).json({
      message: 'Course created successfully',
      course: result.rows[0]
    });
  } catch (error) {
    console.error('Create teacher course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğretmen kendi kursunu güncelleyebilsin (isim, açıklama, aktiflik)
router.put('/teacher/:id', auth, authorize('teacher'), [
  body('name').optional().notEmpty().withMessage('Course name cannot be empty'),
  body('description').optional(),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const teacherId = req.user.id;

    // Kurs gerçekten bu öğretmene mi ait?
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [id, teacherId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu kursu güncelleme yetkiniz yok.' });
    }

    // Dinamik update sorgusu
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Güncellenecek alan yok.' });
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(teacherId);
    const result = await pool.query(
      `UPDATE courses SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND teacher_id = $${paramCount+1} RETURNING id, name, description, course_code, is_active, created_at, updated_at`,
      values
    );
    res.json({
      message: 'Kurs başarıyla güncellendi',
      course: result.rows[0]
    });
  } catch (error) {
    console.error('Update teacher course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğrencinin kayıtlı olduğu kursları listele
router.get('/student', auth, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.course_code, c.is_active, c.created_at, c.updated_at
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       WHERE sc.student_id = $1
       ORDER BY c.created_at DESC`,
      [studentId]
    );
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Student courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğrenci kurs kodu ile kursa katılsın
router.post('/student/join', auth, authorize('student'), [
  body('course_code').notEmpty().withMessage('Course code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { course_code } = req.body;
    const studentId = req.user.id;

    // Kurs var mı?
    const courseResult = await pool.query(
      'SELECT id, is_active FROM courses WHERE course_code = $1',
      [course_code]
    );
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Böyle bir kurs bulunamadı.' });
    }
    const course = courseResult.rows[0];
    if (!course.is_active) {
      return res.status(400).json({ error: 'Bu kurs aktif değil.' });
    }

    // Zaten kayıtlı mı?
    const already = await pool.query(
      'SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2',
      [studentId, course.id]
    );
    if (already.rows.length > 0) {
      return res.status(400).json({ error: 'Bu kursa zaten kayıtlısınız.' });
    }

    // Kayıt et
    await pool.query(
      'INSERT INTO student_courses (student_id, course_id) VALUES ($1, $2)',
      [studentId, course.id]
    );

    res.status(201).json({ message: 'Kursa başarıyla katıldınız.', course_id: course.id });
  } catch (error) {
    console.error('Student join course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 