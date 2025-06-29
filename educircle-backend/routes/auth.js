const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/emailService');

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

// Şifre sıfırlama kodu gönderme
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Lütfen geçerli bir e-posta girin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Kullanıcı var mı kontrol et
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' });
    }

    const user = userResult.rows[0];

    // 6 haneli rastgele kod üret
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Kodun geçerlilik süresi (15 dakika)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    
    await pool.query(
      'DELETE FROM password_reset_codes WHERE user_id = $1',
      [user.id]
    );

    // Yeni kodu kaydet
    await pool.query(
      'INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetCode, expiresAt]
    );

    // Email gönder
    const emailSent = await sendPasswordResetEmail(
      user.email, 
      resetCode, 
      `${user.first_name} ${user.last_name}`
    );

    if (!emailSent) {
      return res.status(500).json({ error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
    }

    res.json({ 
      message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi',
      email: email 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Şifre sıfırlama kodu doğrulama ve yeni şifre belirleme
router.post('/reset-password', [
  body('email').isEmail().withMessage('Lütfen geçerli bir e-posta girin'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Kod 6 haneli olmalı'),
  body('new_password').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalı')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code, new_password } = req.body;

    
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const userId = userResult.rows[0].id;

    
    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = false',
      [userId, code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş kod' });
    }

    // Şifreyi güncelle
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [new_password, userId]
    );

    
    await pool.query(
      'UPDATE password_reset_codes SET used = true WHERE user_id = $1 AND code = $2',
      [userId, code]
    );

    res.json({ message: 'Şifreniz başarıyla güncellendi' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router; 