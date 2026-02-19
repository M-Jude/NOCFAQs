# BCC NOC Knowledge Base - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Frontend Architecture](#frontend-architecture)
9. [Backend Architecture](#backend-architecture)
10. [Data Flow](#data-flow)
11. [Security Considerations](#security-considerations)
12. [Configuration](#configuration)
13. [Deployment](#deployment)
14. [Future Enhancements](#future-enhancements)

---

## System Overview

The **BCC NOC Knowledge Base** is a full-stack web application designed to help Network Operations Center (NOC) engineers access a centralized repository of frequently asked questions (FAQs) and solutions. The system provides role-based access control with three user types: NOC Engineers, HR Managers, and Administrators.

### Core Features
- User authentication with JWT tokens
- Role-based access control (RBAC)
- CRUD operations for FAQ management
- Session tracking and reporting
- Full-text search functionality
- Category-based organization

---

## Architecture Overview

The application follows a **Client-Server architecture** with a **RESTful API** backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    http://localhost:3000                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP Requests (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Express)                         │
│                    http://localhost:5000                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   Auth   │ │  Users   │ │Questions │ │ Sessions │         │
│  │  Route   │ │  Route   │ │  Route   │ │  Route   │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │            │            │            │                │
│       └────────────┴─────┬──────┴────────────┘                │
│                          ▼                                     │
│                   ┌──────────┐                                 │
│                   │Middleware│                                 │
│                   └────┬─────┘                                 │
│                        │                                        │
└────────────────────────┼────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MongoDB Database                             │
│              mongodb://localhost:27017/nocfaqs                 │
│  ┌────────┐  ┌────────────┐  ┌──────────┐                     │
│  │ Users  │  │ Questions  │  │ Sessions │                     │
│  └────────┘  └────────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router | 6.21.1 | Client-side routing |
| Material-UI (MUI) | 5.15.3 | UI Component Library |
| Axios | 1.6.5 | HTTP Client |
| @emotion/react | 11.11.3 | CSS-in-JS |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript Runtime |
| Express | 4.18.2 | Web Framework |
| MongoDB | 6.0+ | NoSQL Database |
| Mongoose | 8.0.3 | ODM Library |
| JSON Web Token | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| CORS | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 16.3.1 | Environment Variables |

### Development Tools
| Technology | Purpose |
|------------|---------|
| nodemon | Auto-restart server on changes |
| react-scripts | React build and dev server |

---

## Project Structure

```
NOCFAQs/
├── backend/                      # Backend application
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User mongoose model
│   │   ├── Question.js         # Question mongoose model
│   │   └── Session.js           # Session mongoose model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── questions.js         # FAQ management routes
│   │   └── sessions.js          # Session reporting routes
│   ├── .env                     # Environment variables
│   ├── package.json              # Backend dependencies
│   ├── seed.js                  # Database seeding script
│   └── server.js                 # Express server entry point
│
├── frontend/                     # Frontend application
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js        # Main layout component
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Dashboard.js     # NOC Engineer dashboard
│   │   │   ├── Questions.js     # Questions list page
│   │   │   ├── QuestionDetail.js# Question detail page
│   │   │   ├── ManageQuestions.js # Admin: manage FAQs
│   │   │   ├── ManageUsers.js    # Admin: manage users
│   │   │   ├── HRDashboard.js    # HR session reports
│   │   │   └── AdminDashboard.js # Admin dashboard
│   │   ├── App.js               # Main app component
│   │   └── index.js             # React entry point
│   ├── package.json              # Frontend dependencies
│   └── package-lock.json
│
├── start-app.bat                # Windows startup script
├── USER_TRAINING_MANUAL.md      # User training guide
└── README.md                    # Project readme
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String,        // Unique, required
  email: String,            // Unique, required
  password: String,        // Hashed, required
  role: String,            // enum: ['admin', 'hr', 'noc_engineer']
  fullName: String,        // Required
  department: String,       // Optional
  createdAt: Date          // Auto-generated
}
```

**Indexes:**
- `username`: Unique index
- `email`: Unique index

**Pre-save Hook:**
- Password is hashed using bcrypt with 10 salt rounds

### Question Collection

```javascript
{
  _id: ObjectId,
  title: String,           // Required
  question: String,        // Required (problem description)
  solution: String,        // Required (resolution steps)
  category: String,        // Required, enum: [network, server, security, 
                           //              database, application, hardware, 
                           //              software, other]
  tags: [String],          // Optional, array of keywords
  views: Number,           // Default: 0, view counter
  createdBy: ObjectId,    // Reference to User
  updatedBy: ObjectId,     // Reference to User
  createdAt: Date,         // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

**Indexes:**
- Text index on: `title`, `question`, `solution`, `tags` (for full-text search)

### Session Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // Reference to User, required
  loginTime: Date,         // Required, default: now
  logoutTime: Date,        // Set on logout
  duration: Number,        // Minutes, calculated on logout
  ipAddress: String,      // Client IP address
  userAgent: String       // Browser/client info
}
```

**Indexes:**
- `user`: Index for user session lookup
- `loginTime`: Index for date range queries

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| POST | `/register` | Create new user | Yes (Admin) |
| GET | `/me` | Get current user | Yes |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | Yes (Admin) |
| GET | `/:id` | Get user by ID | Yes (Admin) |
| PUT | `/:id` | Update user | Yes (Admin) |
| DELETE | `/:id` | Delete user | Yes (Admin) |

### Question Routes (`/api/questions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all questions | No |
| GET | `/:id` | Get question by ID | No |
| POST | `/` | Create question | Yes (Admin) |
| PUT | `/:id` | Update question | Yes (Admin) |
| DELETE | `/:id` | Delete question | Yes (Admin) |

**Query Parameters:**
- `search`: Full-text search term
- `category`: Filter by category
- `page`: Pagination page number
- `limit`: Items per page
- `sort`: Sort field (e.g., 'recent', 'views')

### Session Routes (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get sessions | Yes (HR/Admin) |
| GET | `/stats` | Get session statistics | Yes (HR/Admin) |

**Query Parameters:**
- `startDate`: Filter start date
- `endDate`: Filter end date
- `limit`: Items per page

---

## Authentication & Authorization

### Authentication Flow

1. **Login Request:**
   ```
   POST /api/auth/login
   Body: { "email": "user@bcc.co.ug", "password": "password123" }
   ```

2. **Server Validation:**
   - Find user by email
   - Compare password with bcrypt
   - Create session record

3. **Token Generation:**
   - Generate JWT token with 24-hour expiry
   - Token contains: `{ userId, role }`

4. **Response:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1...",
     "user": { "id": "...", "email": "...", "role": "..." },
     "sessionId": "..."
   }
   ```

### JWT Token Structure

```javascript
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "iat": 1700000000,    // Issued at
  "exp": 1700086400     // Expires (24h)
}
```

### Authorization Middleware

The `auth` middleware verifies JWT tokens:

```javascript
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.userId);
  req.user = user;
  next();
};
```

The `authorize` middleware enforces role-based access:

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

### Role Permissions

| Feature | NOC Engineer | HR Manager | Administrator |
|---------|--------------|------------|----------------|
| View Dashboard | ✓ | ✓ | ✓ |
| View FAQs | ✓ | ✓ | ✓ |
| Search Questions | ✓ | ✓ | ✓ |
| Create Questions | - | - | ✓ |
| Edit Questions | - | - | ✓ |
| Delete Questions | - | - | ✓ |
| Manage Users | - | - | ✓ |
| View Session Reports | - | ✓ | ✓ |

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── AppRoutes
│       ├── Login (unauthenticated)
│       └── Layout (authenticated)
│           ├── AppBar
│           │   ├── MenuButton (hamburger)
│           │   ├── Title
│           │   ├── UserInfo
│           │   └── UserMenu
│           ├── Drawer (sidebar)
│           │   └── NavigationList
│           └── Outlet
│               ├── Dashboard
│               ├── Questions
│               ├── QuestionDetail
│               ├── ManageQuestions
│               ├── ManageUsers
│               └── HRDashboard
```

### Authentication Context

The `AuthContext` manages authentication state:

```javascript
// State
{ user, token, loading, sessionId }

// Functions
login(email, password)  // Authenticate user
logout()                // End session
```

### Protected Routes

Routes are protected by the `ProtectedRoute` component:

```javascript
<ProtectedRoute allowedRoles={['admin']}>
  <ManageQuestions />
</ProtectedRoute>
```

### API Communication

Axios interceptors add the JWT token to all requests:

```javascript
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### State Management

- **React Context**: Authentication state (user, token)
- **React useState**: Local component state
- **React useEffect**: Side effects (data fetching)

---

## Backend Architecture

### Server Entry Point (`server.js`)

```javascript
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGO_URI);

// Routes Registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/sessions', require('./routes/sessions'));

// Server Start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Route Modules

Each route module follows a consistent pattern:

```javascript
const router = express.Router();

// GET all resources
router.get('/', auth, async (req, res) => {
  // Implementation
});

// GET single resource
router.get('/:id', auth, async (req, res) => {
  // Implementation
});

// POST create resource
router.post('/', auth, authorize('admin'), async (req, res) => {
  // Implementation
});

// PUT update resource
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  // Implementation
});

// DELETE resource
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  // Implementation
});

module.exports = router;
```

### Error Handling

Standard error response format:

```javascript
// Success
res.status(200).json({ data: ... });

// Client Error (400, 401, 403, 404)
res.status(400).json({ message: 'Error description' });

// Server Error (500)
res.status(500).json({ message: 'Server error', error: error.message });
```

---

## Data Flow

### Login Flow

```
┌──────────┐    POST /api/auth/login     ┌──────────────┐
│  Browser │ ─────────────────────────►  │    Backend   │
│          │                             │              │
│          │  { token, user, sessionId } │              │
│          │ ◄────────────────────────── │              │
└──────────┘                             └──────────────┘
      │
      ▼
┌──────────┐
│LocalStore │
│ token    │
│ sessionId│
└──────────┘
```

### FAQ Search Flow

```
┌──────────┐    GET /api/questions?search=...    ┌──────────────┐
│  Browser │ ─────────────────────────────────►  │    Backend   │
│          │                                      │              │
│          │  { questions: [...], totalPages }  │              │
│          │ ◄────────────────────────────────── │              │
└──────────┘                                      └──────────────┘
      │
      ▼
┌──────────┐
│  Render  │
│  Cards   │
└──────────┘
```

### Session Tracking Flow

```
┌──────────┐    POST /api/auth/login      ┌──────────────┐
│  Browser │ ─────────────────────────►  │   Backend    │
│          │                              │              │
│          │  Create Session:             │              │
│          │  { user, loginTime, ip }     │              │
└──────────┘                              └──────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │   MongoDB    │
                                        │  Sessions    │
                                        │  Collection  │
                                        └──────────────┘
```

---

## Security Considerations

### Implemented Security Measures

1. **Password Hashing**
   - bcrypt with 10 salt rounds
   - Never stored in plain text

2. **JWT Authentication**
   - Token expiration: 24 hours
   - Stored in localStorage (client)

3. **Role-Based Access Control**
   - Middleware enforces permissions
   - Server-side validation

4. **CORS Configuration**
   - Enabled for cross-origin requests
   - Configured in Express

5. **Input Validation**
   - Required field validation
   - Email format validation
   - Enum validation for roles/categories

### Security Recommendations (Future)

1. Use HTTPS in production
2. Store JWT in httpOnly cookies
3. Implement refresh tokens
4. Add rate limiting
5. Add input sanitization
6. Implement CSRF protection

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/nocfaqs

# JWT Configuration
JWT_SECRET=your_secure_secret_key_here

# Frontend Proxy (already configured in frontend/package.json)
```

### Default Accounts (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@bcc.co.ug | admin123 | Administrator |
| hr@bcc.co.ug | hr123 | HR Manager |
| noc1@bcc.co.ug | noc123 | NOC Engineer |

---

## Deployment

### Development Setup

1. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start MongoDB:**
   ```bash
   mongod
   ```

3. **Seed Database (Optional):**
   ```bash
   cd backend && node seed.js
   ```

4. **Start Application:**
   - Double-click `start-app.bat` (Windows), or
   - Run both servers manually:
     ```bash
     # Terminal 1
     cd backend && npm start
     
     # Terminal 2
     cd frontend && npm start
     ```

### Production Build

1. **Build Frontend:**
   ```bash
   cd frontend && npm run build
   ```

2. **Serve Static Files:**
   - Configure Express to serve the `build` folder
   - Or use a reverse proxy (nginx, Apache)

---

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response

```json
{
  "questions": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Statistics Response

```json
{
  "totalSessions": 150,
  "totalUsers": 25,
  "averageDuration": 45,
  "mostActiveUsers": [...]
}
```

---

## Future Enhancements

1. **Question Voting**: Allow users to upvote helpful solutions
2. **Comments/Feedback**: Add comment system for questions
3. **Attachments**: Support file attachments for solutions
4. **Notifications**: Email notifications for updates
5. **Audit Log**: Detailed change tracking
6. **Advanced Search**: Filters, sorting, faceted search
7. **API Documentation**: Swagger/OpenAPI documentation
8. **Mobile App**: React Native or Flutter mobile client
9. **Analytics Dashboard**: Usage patterns and trends
10. **Multi-tenancy**: Support multiple organizations

---

## Appendix: File Dependencies

### Backend Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "@mui/material": "^5.15.3",
  "@mui/icons-material": "^5.15.3",
  "axios": "^1.6.5"
}
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
