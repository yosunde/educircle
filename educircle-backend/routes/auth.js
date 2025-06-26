const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Lütfen geçerli bir e-posta girin'),
  body('password').notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, school_number, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const user = result.rows[0];

    
    if (user.password_hash !== password) {
      return res.status(400).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        school_number: user.school_number
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        school_number: user.school_number,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı bilgisi (token ile)
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Register user
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalı'),
  body('email').isEmail().withMessage('Geçerli bir e-posta girin'),
  body('password_hash').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('role').isIn(['teacher', 'student']).withMessage('Rol teacher veya student olmalı'),
  body('school_number').notEmpty().withMessage('Okul numarası zorunlu'),
  body('first_name').notEmpty().withMessage('Ad zorunlu'),
  body('last_name').notEmpty().withMessage('Soyad zorunlu')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password_hash, role, school_number, first_name, last_name } = req.body;

    // Aynı email, username veya school_number var mı?
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 OR school_number = $3',
      [email, username, school_number]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email, kullanıcı adı veya okul numarası zaten kullanılıyor.' });
    }

    // Kayıt
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, school_number, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, role, school_number, first_name, last_name`,
      [username, email, password_hash, role, school_number, first_name, last_name]
    );
    const user = result.rows[0];

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        school_number: user.school_number
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router; 