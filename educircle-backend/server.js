const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
console.log('--- SUNUCU BAŞLADI ---');
console.log('Kullanılan JWT Secret:', process.env.JWT_SECRET);
console.log('--------------------');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); 
app.use(morgan('combined')); 
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); 

// Database connection
const { pool, testConnection, initDatabase } = require('./config/database');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/groups', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
const documentsRoutes = require('./routes/documents');
app.use('/api', documentsRoutes);


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduCircle Backend is running!',
    timestamp: new Date().toISOString()
  });
});


app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to EduCircle Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      projects: '/api/projects',
      groups: '/api/groups',
      documents: '/api/documents',
      notifications: '/api/notifications'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 EduCircle Backend API is ready!`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 
