const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Kursa ait projeleri listele (hem öğretmen hem öğrenci görebilir)
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Öğretmen ise kendi kursunu kontrol et, öğrenci ise kayıtlı olduğu kursu kontrol et
    let courseCheck;
    if (userRole === 'teacher') {
      courseCheck = await pool.query(
        'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
        [courseId, userId]
      );
    } else {
      courseCheck = await pool.query(
        'SELECT c.id FROM courses c JOIN student_courses sc ON c.id = sc.course_id WHERE c.id = $1 AND sc.student_id = $2',
        [courseId, userId]
      );
    }

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu kursa erişim yetkiniz yok.' });
    }

    // Kursa ait projeleri getir
    if (userRole === 'student') {
      const result = await pool.query(
        `SELECT p.id, p.name, p.description, p.project_code, p.due_date, p.is_active, p.created_at, p.updated_at,
                (sp.id IS NOT NULL) AS joined
         FROM projects p
         LEFT JOIN student_projects sp ON sp.project_id = p.id AND sp.student_id = $2
         WHERE p.course_id = $1
         ORDER BY p.created_at DESC`,
        [courseId, userId]
      );
      res.json({ projects: result.rows });
    } else {
      const result = await pool.query(
        `SELECT p.id, p.name, p.description, p.project_code, p.due_date, p.is_active, p.created_at, p.updated_at,
                false AS joined
         FROM projects p
         WHERE p.course_id = $1
         ORDER BY p.created_at DESC`,
        [courseId]
      );
      res.json({ projects: result.rows });
    }
  } catch (error) {
    console.error('Get course projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğretmen kursa yeni proje eklesin
router.post('/course/:courseId', auth, authorize('teacher'), [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').optional(),
  body('due_date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { name, description, due_date } = req.body;
    const teacherId = req.user.id;

    // Kurs gerçekten bu öğretmene mi ait?
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, teacherId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu kursa proje ekleme yetkiniz yok.' });
    }

    const projectCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO projects (course_id, teacher_id, name, description, project_code, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, project_code, due_date, is_active, created_at, updated_at`,
      [courseId, teacherId, name, description || '', projectCode, due_date || null]
    );

    // Kurs öğrencilerine yeni proje bildirimi gönder
    const studentsQuery = `
      SELECT sc.student_id 
      FROM student_courses sc 
      WHERE sc.course_id = $1
    `;
    const studentsResult = await pool.query(studentsQuery, [courseId]);
    
    for (const student of studentsResult.rows) {
      const notificationQuery = `
        INSERT INTO notifications (user_id, type, message, link)
        VALUES ($1, $2, $3, $4)
      `;
      
      const dueDateText = due_date ? ` - Teslim: ${new Date(due_date).toLocaleDateString('tr-TR')}` : '';
      const message = `Yeni proje: "${name}"${dueDateText} - Katılmak için kod: ${projectCode}`;
      const link = `/projects/join`;
      
      await pool.query(notificationQuery, [
        student.student_id, 
        'announcement', 
        message, 
        link
      ]);
    }

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğretmen projeyi güncelleyebilsin
router.put('/:projectId', auth, authorize('teacher'), [
  body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
  body('description').optional(),
  body('due_date').optional().isISO8601().withMessage('Invalid date format'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { name, description, due_date, is_active } = req.body;
    const teacherId = req.user.id;

    // Proje gerçekten bu öğretmene mi ait?
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND teacher_id = $2',
      [projectId, teacherId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu projeyi güncelleme yetkiniz yok.' });
    }

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
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount}`);
      values.push(due_date);
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
    values.push(projectId);
    values.push(teacherId);

    const result = await pool.query(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND teacher_id = $${paramCount+1} RETURNING id, name, description, project_code, due_date, is_active, created_at, updated_at`,
      values
    );

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğrenci proje kodu ile projeye katılsın
router.post('/join', auth, authorize('student'), [
  body('project_code').notEmpty().withMessage('Project code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { project_code } = req.body;
    const studentId = req.user.id;

    // Proje var mı ve aktif mi?
    const projectResult = await pool.query(
      'SELECT id, is_active FROM projects WHERE project_code = $1',
      [project_code]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Böyle bir proje bulunamadı.' });
    }
    const project = projectResult.rows[0];
    if (!project.is_active) {
      return res.status(400).json({ error: 'Bu proje aktif değil.' });
    }

    // Öğrenci bu projenin kursuna kayıtlı mı?
    const courseCheck = await pool.query(
      'SELECT p.course_id FROM projects p JOIN student_courses sc ON p.course_id = sc.course_id WHERE p.id = $1 AND sc.student_id = $2',
      [project.id, studentId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bu projeye katılmak için önce kursa kayıt olmalısınız.' });
    }

    // Zaten projeye katılmış mı?
    const already = await pool.query(
      'SELECT id FROM student_projects WHERE student_id = $1 AND project_id = $2',
      [studentId, project.id]
    );
    if (already.rows.length > 0) {
      return res.status(400).json({ error: 'Bu projeye zaten katılmışsınız.' });
    }

    // Projeye katıl
    await pool.query(
      'INSERT INTO student_projects (student_id, project_id) VALUES ($1, $2)',
      [studentId, project.id]
    );

    res.status(201).json({ 
      message: 'Projeye başarıyla katıldınız.', 
      project_id: project.id 
    });
  } catch (error) {
    console.error('Student join project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğretmenin tüm projelerini listele
router.get('/teacher', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.project_code, p.due_date, p.is_active, p.created_at, p.updated_at,
              c.id as course_id, c.name as course_name, c.course_code
       FROM projects p
       JOIN courses c ON p.course_id = c.id
       WHERE p.teacher_id = $1
       ORDER BY p.created_at DESC`,
      [teacherId]
    );
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Teacher projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğrencinin katıldığı projeleri listele
router.get('/student', auth, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.project_code, p.due_date, p.is_active, p.created_at, p.updated_at,
              c.name as course_name, c.course_code
       FROM student_projects sp
       JOIN projects p ON sp.project_id = p.id
       JOIN courses c ON p.course_id = c.id
       WHERE sp.student_id = $1
       ORDER BY p.created_at DESC`,
      [studentId]
    );
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Student projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Tekil proje detayını getir (hem öğretmen hem öğrenci erişebilir)
router.get('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Proje var mı?
    const projectResult = await pool.query(
      `SELECT p.id, p.name, p.description, p.project_code, p.due_date, p.is_active, p.created_at, p.updated_at,
              c.id as course_id, c.name as course_name, c.course_code, c.teacher_id,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM projects p
       JOIN courses c ON p.course_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE p.id = $1`,
      [projectId]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proje bulunamadı.' });
    }
    const project = projectResult.rows[0];

    // Erişim kontrolü: Öğretmen kendi projesi mi, öğrenci projeye kayıtlı mı?
    if (userRole === 'teacher' && project.teacher_id !== userId) {
      return res.status(403).json({ error: 'Bu projeye erişim yetkiniz yok.' });
    }
    if (userRole === 'student') {
      const studentCheck = await pool.query(
        'SELECT id FROM student_projects WHERE project_id = $1 AND student_id = $2',
        [projectId, userId]
      );
      if (studentCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Bu projeye erişim yetkiniz yok.' });
      }
    }

    // Projedeki öğrenci sayısı
    const studentCountResult = await pool.query(
      'SELECT COUNT(*) FROM student_projects WHERE project_id = $1',
      [projectId]
    );
    const student_count = parseInt(studentCountResult.rows[0].count, 10);

    res.json({
      project: {
        ...project,
        student_count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 