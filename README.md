# NOC FAQs - Network Operations Center Knowledge Base

A ReactJS and NodeJS application for NOC engineers to find common solutions to frequently encountered problems.

## Features

### Three User Roles:
1. **HR Manager** - Track user session data (login times, duration, usage frequency)
2. **NOC Engineer** - Query and find answers to problems
3. **Admin** - Manage questions, solutions, and users

### Features:
- User authentication and role-based access control
- Session tracking (login/logout times, duration)
- FAQ search and filtering by category
- Admin panel for managing questions and solutions
- User management for admins
- Dashboard with statistics

## Tech Stack

- **Frontend**: ReactJS, Material-UI
- **Backend**: NodeJS, Express
- **Database**: MongoDB

## Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud instance)

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Database Setup

Make sure MongoDB is running. Update the `MONGO_URI` in `backend/.env` if needed.

### 4. Seed Data

Run the seed script to create default users and sample questions:

```bash
cd backend
node seed.js
```

This will create:
- Admin user: admin@nocfaqs.com / admin123
- HR user: hr@nocfaqs.com / hr123
- NOC Engineer: noc1@nocfaqs.com / noc123

## Running the Application

### Start Backend

```bash
cd backend
npm start
```

Server will run on http://localhost:5000

### Start Frontend

```bash
cd frontend
npm start
```

Application will open on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- POST `/api/auth/register` - Register new user (admin only)
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - Get all users (admin/HR only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user (admin only)
- DELETE `/api/users/:id` - Delete user (admin only)

### Questions
- GET `/api/questions` - Get all questions (with search/filter)
- GET `/api/questions/:id` - Get question by ID
- POST `/api/questions` - Create question (admin only)
- PUT `/api/questions/:id` - Update question (admin only)
- DELETE `/api/questions/:id` - Delete question (admin only)
- GET `/api/questions/meta/categories` - Get all categories

### Sessions
- GET `/api/sessions` - Get all sessions (admin/HR only)
- GET `/api/sessions/stats` - Get session statistics (admin/HR only)
- GET `/api/sessions/active` - Get current active session

## Project Structure

```
NOCFAQs/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── questions.js
│   │   └── sessions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Questions.js
│   │   │   ├── QuestionDetail.js
│   │   │   ├── HRDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ManageQuestions.js
│   │   │   └── ManageUsers.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```
