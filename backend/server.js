/**
 * NOC FAQs Backend Server
 * 
 * This is the main entry point for the NOC (Network Operations Center) FAQs system.
 * It sets up the Express server, connects to MongoDB, and registers all API routes.
 * 
 * @author NOC Team
 * @version 1.0.0
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable Cross-Origin Resource Sharing (CORS)
// Allows the frontend to communicate with the backend API
app.use(cors());

// Parse incoming JSON requests
// Enables the server to handle JSON payloads in request bodies
app.use(express.json());

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// MongoDB connection URI
// Uses environment variable or falls back to local development database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nocfaqs';

// Connect to MongoDB using Mongoose ODM
// Provides schema-based solution for modeling application data
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB successfully');
    console.log(`  Database: ${MONGO_URI}`);
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1); // Exit if database connection fails
  });

// ============================================================================
// API ROUTES
// ============================================================================
// All routes are prefixed with /api for clean URL structure

// Authentication routes (login, logout, register, current user)
app.use('/api/auth', require('./routes/auth'));

// User management routes (admin only for CRUD operations)
app.use('/api/users', require('./routes/users'));

// Question/FAQ routes (search, view, manage)
app.use('/api/questions', require('./routes/questions'));

// Session tracking routes (login/logout history)
app.use('/api/sessions', require('./routes/sessions'));

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

// Simple health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Determine port from environment or use default
const PORT = process.env.PORT || 5000;

// Start the HTTP server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('  NOC FAQs Backend Server');
  console.log('='.repeat(50));
  console.log(`  Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app; // Export for testing purposes
