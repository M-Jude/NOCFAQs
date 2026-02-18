const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Question = require('./models/Question');
const Session = require('./models/Session');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nocfaqs';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Session.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = new User({
      username: 'admin',
      email: 'admin@nocfaqs.com',
      password: 'admin123',
      role: 'admin',
      fullName: 'System Administrator',
      department: 'IT'
    });
    await admin.save();

    const hr = new User({
      username: 'hr',
      email: 'hr@nocfaqs.com',
      password: 'hr123',
      role: 'hr',
      fullName: 'HR Manager',
      department: 'Human Resources'
    });
    await hr.save();

    const noc1 = new User({
      username: 'noc_engineer1',
      email: 'noc1@nocfaqs.com',
      password: 'noc123',
      role: 'noc_engineer',
      fullName: 'John NOC',
      department: 'Network Operations'
    });
    await noc1.save();

    const noc2 = new User({
      username: 'noc_engineer2',
      email: 'noc2@nocfaqs.com',
      password: 'noc123',
      role: 'noc_engineer',
      fullName: 'Jane NOC',
      department: 'Network Operations'
    });
    await noc2.save();

    console.log('Created users');

    // Create sample questions
    const questions = [
      {
        title: 'Server Unreachable - Ping Timeout',
        question: 'One of our servers is not responding to ping requests. What are the initial troubleshooting steps?',
        solution: '1. Check physical connectivity\n2. Verify IP configuration\n3. Check if firewall is blocking ICMP\n4. Verify network switch port status\n5. Check server logs for any hardware issues\n6. Contact network team if issue persists',
        category: 'server',
        tags: ['ping', 'unreachable', 'network', 'troubleshooting'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'VPN Connection Failing',
        question: 'Users report they cannot connect to the corporate VPN. Getting authentication errors.',
        solution: '1. Verify user credentials are active\n2. Check if VPN server is running\n3. Verify certificate validity\n4. Check network firewall rules\n5. Ensure user has VPN access permission\n6. Review VPN logs for specific error codes',
        category: 'network',
        tags: ['vpn', 'connection', 'authentication', 'remote'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'Database Connection Pool Exhausted',
        question: 'Application showing "Too many connections" error to database. How to resolve?',
        solution: '1. Check current connection count\n2. Identify long-running queries\n3. Increase max_connections if needed\n4. Implement connection pooling\n5. Close unused connections\n6. Restart database if critical',
        category: 'database',
        tags: ['database', 'connections', 'performance', 'pool'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'SSL Certificate Expired',
        question: 'Website showing security warning due to expired SSL certificate. How to renew?',
        solution: '1. Generate new CSR\n2. Submit to Certificate Authority\n3. Install new certificate\n4. Update certificate in load balancer\n5. Verify certificate chain\n6. Set up auto-renewal for future',
        category: 'security',
        tags: ['ssl', 'certificate', 'https', 'security'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'Network Slowness - High Latency',
        question: 'Users experiencing slow network performance. Ping shows high latency.',
        solution: '1. Run traceroute to identify bottlenecks\n2. Check bandwidth utilization\n3. Look for broadcast storms\n4. Verify QoS settings\n5. Check for malware/spyware\n6. Contact ISP if external issue',
        category: 'network',
        tags: ['network', 'slow', 'latency', 'performance'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'User Account Locked Out',
        question: 'User cannot login due to account lockout. How to unlock?',
        solution: '1. Verify user identity\n2. Check failed login attempts\n3. Unlock account via AD or IAM\n4. Reset password if needed\n5. Check for brute force attacks\n6. Provide guidance on password policy',
        category: 'security',
        tags: ['account', 'lockout', 'login', 'ad'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'Application Server Crash',
        question: 'Application server keeps crashing intermittently. How to diagnose?',
        solution: '1. Check application logs\n2. Review system logs\n3. Verify resource usage (CPU, RAM, Disk)\n4. Check for memory leaks\n5. Review recent changes\n6. Enable crash dump analysis',
        category: 'application',
        tags: ['server', 'crash', 'application', 'debug'],
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        title: 'Backup Failed Last Night',
        question: 'Automated backup job failed. How to troubleshoot and recover?',
        solution: '1. Check backup logs for error messages\n2. Verify storage space availability\n3. Check backup software status\n4. Test network connectivity to backup location\n5. Run manual backup if critical\n6. Set up monitoring alerts',
        category: 'server',
        tags: ['backup', 'failure', 'restore', 'data'],
        createdBy: admin._id,
        updatedBy: admin._id
      }
    ];

    await Question.insertMany(questions);
    console.log('Created sample questions');

    // Create sample sessions
    const now = new Date();
    const sessions = [
      {
        user: admin._id,
        loginTime: new Date(now - 2 * 60 * 60 * 1000),
        logoutTime: new Date(now - 1 * 60 * 60 * 1000),
        duration: 60,
        ipAddress: '192.168.1.100'
      },
      {
        user: hr._id,
        loginTime: new Date(now - 4 * 60 * 60 * 1000),
        logoutTime: new Date(now - 2.5 * 60 * 60 * 1000),
        duration: 90,
        ipAddress: '192.168.1.101'
      },
      {
        user: noc1._id,
        loginTime: new Date(now - 8 * 60 * 60 * 1000),
        logoutTime: new Date(now - 6 * 60 * 60 * 1000),
        duration: 120,
        ipAddress: '192.168.1.102'
      },
      {
        user: noc2._id,
        loginTime: new Date(now - 24 * 60 * 60 * 1000),
        logoutTime: new Date(now - 22 * 60 * 60 * 1000),
        duration: 120,
        ipAddress: '192.168.1.103'
      },
      {
        user: noc1._id,
        loginTime: new Date(now - 1 * 60 * 60 * 1000),
        logoutTime: null,
        duration: 0,
        ipAddress: '192.168.1.102'
      }
    ];

    await Session.insertMany(sessions);
    console.log('Created sample sessions');

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@nocfaqs.com / admin123');
    console.log('HR: hr@nocfaqs.com / hr123');
    console.log('NOC Engineer: noc1@nocfaqs.com / noc123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
