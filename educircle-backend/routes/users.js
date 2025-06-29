const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  console.log('req.user:', req.user);
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, school_number, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, [
  body('first_name').optional().notEmpty(),
  body('last_name').optional().notEmpty(),
  body('school_number').optional().notEmpty(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, school_number, email } = req.body;

    // Email unique mi kontrolü
    if (email) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;
    if (first_name) { updateFields.push(`first_name = $${paramCount}`); values.push(first_name); paramCount++; }
    if (last_name) { updateFields.push(`last_name = $${paramCount}`); values.push(last_name); paramCount++; }
    if (school_number) { updateFields.push(`school_number = $${paramCount}`); values.push(school_number); paramCount++; }
    if (email) { updateFields.push(`email = $${paramCount}`); values.push(email); paramCount++; }
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, first_name, last_name, school_number, role, updated_at`,
      values
    );
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me/password
router.put('/me/password', auth, [
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (result.rows[0].password_hash !== old_password) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }
    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [new_password, userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, [
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { full_name, email } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }


    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (full_name) {
      updateFields.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, full_name, role, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user enrollments
router.get('/:id/enrollments', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        e.id,
        e.enrolled_at,
        e.completed_at,
        c.id as course_id,
        c.title as course_title,
        c.description as course_description,
        c.price,
        c.duration_hours,
        c.level,
        u.full_name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `, [id]);

    res.json({
      enrollments: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 