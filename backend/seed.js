/**
 * Database Seeder
 * 
 * Populates the database with initial data for development and testing.
 * Creates default users, sample questions, and session history.
 * 
 * @usage node seed.js
 * @note Run this script once to populate the database with sample data
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// MongoDB connection URI
// Uses environment variable or falls back to local development database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nocfaqs';

// Import required modules
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const Session = require('./models/Session');

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Default user accounts
 * These credentials can be used to log in after seeding
 */
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@nocfaqs.com',
    password: 'admin123',
    role: 'admin',
    fullName: 'System Administrator',
    department: 'IT'
  },
  {
    username: 'hr',
    email: 'hr@nocfaqs.com',
    password: 'hr123',
    role: 'hr',
    fullName: 'HR Manager',
    department: 'Human Resources'
  },
  {
    username: 'noc_engineer1',
    email: 'noc1@nocfaqs.com',
    password: 'noc123',
    role: 'noc_engineer',
    fullName: 'John NOC',
    department: 'Network Operations'
  },
  {
    username: 'noc_engineer2',
    email: 'noc2@nocfaqs.com',
    password: 'noc123',
    role: 'noc_engineer',
    fullName: 'Jane NOC',
    department: 'Network Operations'
  }
];

/**
 * Sample FAQ questions covering various NOC scenarios
 */
const sampleQuestions = [
  {
    title: 'Server Unreachable - Ping Timeout',
    question: 'One of our servers is not responding to ping requests. What are the initial troubleshooting steps?',
    solution: '1. Check physical connectivity\n2. Verify IP configuration\n3. Check if firewall is blocking ICMP\n4. Verify network switch port status\n5. Check server logs for any hardware issues\n6. Contact network team if issue persists',
    category: 'server',
    tags: ['ping', 'unreachable', 'network', 'troubleshooting']
  },
  {
    title: 'VPN Connection Failing',
    question: 'Users report they cannot connect to the corporate VPN. Getting authentication errors.',
    solution: '1. Verify user credentials are active\n2. Check if VPN server is running\n3. Verify certificate validity\n4. Check network firewall rules\n5. Ensure user has VPN access permission\n6. Review VPN logs for specific error codes',
    category: 'network',
    tags: ['vpn', 'connection', 'authentication', 'remote']
  },
  {
    title: 'Database Connection Pool Exhausted',
    question: 'Application showing "Too many connections" error to database. How to resolve?',
    solution: '1. Check current connection count\n2. Identify long-running queries\n3. Increase max_connections if needed\n4. Implement connection pooling\n5. Close unused connections\n6. Restart database if critical',
    category: 'database',
    tags: ['database', 'connections', 'performance', 'pool']
  },
  {
    title: 'SSL Certificate Expired',
    question: 'Website showing security warning due to expired SSL certificate. How to renew?',
    solution: '1. Generate new CSR\n2. Submit to Certificate Authority\n3. Install new certificate\n4. Update certificate in load balancer\n5. Verify certificate chain\n6. Set up auto-renewal for future',
    category: 'security',
    tags: ['ssl', 'certificate', 'https', 'security']
  },
  {
    title: 'Network Slowness - High Latency',
    question: 'Users experiencing slow network performance. Ping shows high latency.',
    solution: '1. Run traceroute to identify bottlenecks\n2. Check bandwidth utilization\n3. Look for broadcast storms\n4. Verify QoS settings\n5. Check for malware/spyware\n6. Contact ISP if external issue',
    category: 'network',
    tags: ['network', 'slow', 'latency', 'performance']
  },
  {
    title: 'User Account Locked Out',
    question: 'User cannot login due to account lockout. How to unlock?',
    solution: '1. Verify user identity\n2. Check failed login attempts\n3. Unlock account via AD or IAM\n4. Reset password if needed\n5. Check for brute force attacks\n6. Provide guidance on password policy',
    category: 'security',
    tags: ['account', 'lockout', 'login', 'ad']
  },
  {
    title: 'Application Server Crash',
    question: 'Application server keeps crashing intermittently. How to diagnose?',
    solution: '1. Check application logs\n2. Review system logs\n3. Verify resource usage (CPU, RAM, Disk)\n4. Check for memory leaks\n5. Review recent changes\n6. Enable crash dump analysis',
    category: 'application',
    tags: ['server', 'crash', 'application', 'debug']
  },
  {
    title: 'Backup Failed Last Night',
    question: 'Automated backup job failed. How to troubleshoot and recover?',
    solution: '1. Check backup logs for error messages\n2. Verify storage space availability\n3. Check backup software status\n4. Test network connectivity to backup location\n5. Run manual backup if critical\n6. Set up monitoring alerts',
    category: 'server',
    tags: ['backup', 'failure', 'restore', 'data']
  }
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

/**
 * Main seeding function
 * Connects to MongoDB and populates the database
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB successfully\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Session.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Create users
    console.log('👤 Creating default users...');
    const createdUsers = await User.insertMany(defaultUsers);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Create questions with user references
    console.log('📝 Creating sample FAQ questions...');
    const questionsWithRefs = sampleQuestions.map(q => ({
      ...q,
      createdBy: createdUsers[0]._id, // Created by admin
      updatedBy: createdUsers[0]._id
    }));
    const createdQuestions = await Question.insertMany(questionsWithRefs);
    console.log(`✓ Created ${createdQuestions.length} sample questions\n`);

    // Create sample sessions
    console.log('⏱️  Creating sample session history...');
    const now = new Date();
    const sessionsData = [
      {
        user: createdUsers[0]._id, // admin
        loginTime: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
        logoutTime: new Date(now - 1 * 60 * 60 * 1000), // 1 hour ago
        duration: 60,
        ipAddress: '192.168.1.100'
      },
      {
        user: createdUsers[1]._id, // hr
        loginTime: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
        logoutTime: new Date(now - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        duration: 90,
        ipAddress: '192.168.1.101'
      },
      {
        user: createdUsers[2]._id, // noc1
        loginTime: new Date(now - 8 * 60 * 60 * 1000), // 8 hours ago
        logoutTime: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
        duration: 120,
        ipAddress: '192.168.1.102'
      },
      {
        user: createdUsers[3]._id, // noc2
        loginTime: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
        logoutTime: new Date(now - 22 * 60 * 60 * 1000), // 22 hours ago
        duration: 120,
        ipAddress: '192.168.1.103'
      },
      {
        user: createdUsers[2]._id, // noc1 - active session
        loginTime: new Date(now - 1 * 60 * 60 * 1000), // 1 hour ago
        logoutTime: null,
        duration: 0,
        ipAddress: '192.168.1.102'
      }
    ];
    
    await Session.insertMany(sessionsData);
    console.log('✓ Created sample sessions\n');

    // Print summary
    console.log('=' .repeat(50));
    console.log('  ✅ DATABASE SEEDING COMPLETED');
    console.log('=' .repeat(50));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('-'.repeat(30));
    console.log('  Admin:    admin@nocfaqs.com  / admin123');
    console.log('  HR:       hr@nocfaqs.com     / hr123');
    console.log('  NOC Eng:  noc1@nocfaqs.com   / noc123');
    console.log('  NOC Eng:  noc2@nocfaqs.com   / noc123');
    console.log('=' .repeat(50));
    console.log('');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
