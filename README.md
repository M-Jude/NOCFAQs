# NOC FAQs - Knowledge Base System

A comprehensive Q&A platform for Network Operations Center (NOC) teams to document and share solutions for common technical issues.

## Features

- **User Authentication**: Secure JWT-based login with role-based access control
- **FAQ Management**: Create, edit, and search through knowledge base articles
- **Categories**: Organize questions by type (Network, Server, Security, Database, etc.)
- **Session Tracking**: Monitor user login activity and system usage
- **Role-Based Access**:
  - **Admin**: Full system access, user management, question management
  - **HR**: View session reports and user activity
  - **NOC Engineer**: Browse and search FAQs

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Material UI v5
- React Router v6
- Axios for API calls

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Installation

1. **Clone the repository**
   ```bash
   cd noc-faqs
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or install individually
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your settings
   ```

4. **Seed the database (optional)**
   ```bash
   cd backend && npm run seed
   ```
   This creates test users and sample FAQ questions.

5. **Start the application**
   ```bash
   # Start backend (terminal 1)
   npm run start:backend
   
   # Start frontend (terminal 2)
   npm run start:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Default Login Credentials

After seeding the database:
| Role    | Email              | Password  |
|---------|-------------------|-----------|
| Admin   | admin@nocfaqs.com | admin123  |
| HR      | hr@nocfaqs.com    | hr123     |
| NOC Eng | noc1@nocfaqs.com  | noc123    |

## Project Structure

```
noc-faqs/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Question.js
│   │   └── Session.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── questions.js
│   │   └── sessions.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js
│   ├── server.js        # Main server file
│   ├── seed.js          # Database seeder
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json         # Root package.json
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Create user (admin only)
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users (admin/HR)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Questions
- `GET /api/questions` - List/search questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)
- `GET /api/questions/meta/categories` - List categories

### Sessions
- `GET /api/sessions` - List sessions (admin/HR)
- `GET /api/sessions/stats` - Session statistics (admin/HR)
- `GET /api/sessions/active` - Get active session

## Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build:frontend
   ```

2. **Configure for production**
   - Set `NODE_ENV=production` in backend/.env
   - Update `MONGO_URI` to your production MongoDB
   - Generate a secure `JWT_SECRET`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/nocfaqs |
| JWT_SECRET | JWT signing secret | (required for production) |
| JWT_EXPIRES_IN | Token expiration | 24h |

## License

MIT License - See LICENSE file for details
