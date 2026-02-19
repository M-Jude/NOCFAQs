# BCC NOC Knowledge Base - User Training Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles](#user-roles)
3. [Getting Started](#getting-started)
4. [Login Workflow](#login-workflow)
5. [NOC Engineer Workflows](#noc-engineer-workflows)
6. [HR Manager Workflows](#hr-manager-workflows)
7. [Administrator Workflows](#administrator-workflows)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

The **BCC NOC Knowledge Base** is a web-based application designed to help Network Operations Center (NOC) engineers quickly find solutions to common technical problems. The system serves as a centralized repository of frequently asked questions (FAQs), solutions, and troubleshooting guides.

### Key Features
- **Centralized Knowledge Base**: Searchable database of NOC-related questions and solutions
- **Role-Based Access**: Three user roles with different permissions
- **Session Tracking**: Records user login activity for audit purposes
- **Category Organization**: Questions organized by technical category
- **Full-Text Search**: Quickly find relevant solutions

---

## User Roles

The system has three user roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **NOC Engineer** | Primary users who search and view FAQs | View only |
| **HR Manager** | Manages session reports and user activity | View + Reports |
| **Administrator** | Full system control | Full access (CRUD) |

### Default Login Credentials
After system installation, the following default accounts are available:

| Email | Password | Role |
|-------|----------|------|
| admin@bcc.co.ug | admin123 | Administrator |
| hr@bcc.co.ug | hr123 | HR Manager |
| noc1@bcc.co.ug | noc123 | NOC Engineer |

> **Important**: Change default passwords after first login for security purposes.

---

## Getting Started

### Starting the Application

1. **Locate the batch file**: Navigate to the `NOCFAQs` folder where `start-app.bat` is located
2. **Run the application**: Double-click `start-app.bat` or run it from Command Prompt
3. **Wait for servers to start**: Two terminal windows will open automatically
   - Backend server: Runs on port 5000
   - Frontend server: Runs on port 3000

### Accessing the Application

1. Open your web browser (Chrome, Firefox, Edge, or Safari)
2. Navigate to: `http://localhost:3000`
3. The login page will be displayed

---

## Login Workflow

### Step-by-Step Login Process

1. **Navigate to Login Page**
   - URL: `http://localhost:3000/login`
   - You will see the BCC NOC Knowledge Base login card

2. **Enter Credentials**
   - In the **Email** field, enter your email address (format: `yourname@bcc.co.ug`)
   - In the **Password** field, enter your password
   - Click **Sign In** button

3. **Authentication**
   - The system validates your credentials against the database
   - On success: You are redirected to the Dashboard
   - On failure: An error message displays "Invalid credentials"

4. **Session Recording**
   - Upon successful login, a session is automatically created
   - The system records: login time, user ID, and IP address
   - Session ends when you click **Logout**

### Logging Out

1. Click on your avatar icon in the top-right corner of the AppBar
2. Select **Logout** from the dropdown menu
3. You will be redirected to the login page
4. Your session logout time is recorded in the system

---

## NOC Engineer Workflows

NOC Engineers are the primary users of the system. They can browse, search, and view FAQ solutions.

### Workflow 1: Viewing the Dashboard

**Purpose**: Get an overview of available knowledge base categories

**Steps**:
1. After login, you land on the **Dashboard** page
2. The dashboard displays:
   - Welcome message with your name
   - Search bar for quick solutions
   - Categories grid showing question counts per category
   - Quick action buttons

**Navigation**:
- Use the **sidebar menu** on the left to navigate to different sections
- Click on any **category card** to view questions in that category

### Workflow 2: Searching for Solutions

**Purpose**: Find specific solutions to technical problems

**Method 1: Quick Search from Dashboard**
1. Type your search term in the search bar on the Dashboard
2. Press **Enter** or wait for 2+ characters
3. Results display in the Questions page

**Method 2: Advanced Search**
1. Navigate to **FAQs** from the sidebar
2. Use the search field to enter keywords
3. Press **Enter** to search
4. Use the **Category** dropdown to filter by technical area

**Method 3: Browse by Category**
1. From the Dashboard, click on a category card (e.g., Network, Server, Security)
2. All questions in that category are displayed

### Workflow 3: Viewing a Question Detail

**Purpose**: Read the full problem description and solution

**Steps**:
1. From the Questions list, click on any question card
2. The Question Detail page displays:
   - **Problem**: The technical issue/question (highlighted in orange)
   - **Solution**: Step-by-step resolution (highlighted in green)
   - **Category**: Technical area (color-coded chip)
   - **Tags**: Related keywords
   - **View Count**: Number of times this solution was viewed
   - **Created/Updated**: Timestamps

3. Click **Back to Questions** to return to the list

### Available Categories

| Category | Color | Description |
|----------|-------|-------------|
| Network | Blue | Routing, switching, VPN issues |
| Server | Green | Server configuration, performance |
| Security | Red | Authentication, firewall, access control |
| Database | Purple | SQL issues, data corruption |
| Application | Orange | Software, web apps, services |
| Hardware | Gray | Physical equipment, peripherals |
| Software | Cyan | Licensing, installation, updates |
| Brown | Other | Miscellaneous issues |

---

## HR Manager Workflows

HR Managers have access to session reports and can monitor system usage.

### Workflow 1: Accessing Session Reports

**Purpose**: View user login activity and system usage statistics

**Steps**:
1. Click on **Session Reports** in the sidebar menu
2. The HR Dashboard loads with statistics

### Workflow 2: Viewing Session Statistics

**Purpose**: Understand system usage patterns

**The Dashboard displays**:

1. **Summary Cards**:
   - **Total Sessions**: Number of login events in the selected period
   - **Active Users**: Unique users who logged in
   - **Average Duration**: Mean session length

2. **Most Active Users**: Cards showing:
   - User's full name
   - Department
   - Number of sessions
   - Total time spent

3. **Recent Sessions Table**: Shows:
   - User name
   - Role
   - Department
   - Login time
   - Logout time
   - Session duration
   - IP address

### Workflow 3: Filtering Session Data

**Purpose**: View sessions within a specific date range

**Steps**:
1. On the Session Reports page, locate the date filters
2. **Start Date**: Click the date picker and select the start date
3. **End Date**: Click the date picker and select the end date
4. Click **Apply Filter** button
5. The data refreshes to show only sessions in that range

### Workflow 4: Understanding Session Status

**Sessions can have two states**:

1. **Active (Currently Logged In)**
   - Logout Time shows: "Active" chip (green)
   - Duration shows: "Active"

2. **Completed**
   - Logout Time shows the actual logout timestamp
   - Duration shows actual session length (e.g., "2h 15m")

---

## Administrator Workflows

Administrators have full control over the system, including managing questions and users.

### Workflow 1: Managing Questions

Administrators can create, edit, and delete FAQ entries.

#### Creating a New Question

**Purpose**: Add a new FAQ to the knowledge base

**Steps**:
1. Navigate to **Manage Questions** from the sidebar
2. Click the **Add Question** button (top-right)
3. Fill in the dialog form:

| Field | Description | Required |
|-------|-------------|----------|
| Title | Brief descriptive title | Yes |
| Problem/Question | Detailed description of the issue | Yes |
| Solution | Step-by-step resolution | Yes |
| Category | Technical category | Yes |
| Tags | Comma-separated keywords | No |

4. Click **Create** to save
5. Success message appears: "Question created successfully"

#### Editing an Existing Question

**Purpose**: Update an existing FAQ with new information

**Steps**:
1. Navigate to **Manage Questions**
2. Locate the question in the table
3. Click the **Edit icon** (pencil) in the Actions column
4. The edit dialog opens with current values
5. Modify the fields as needed
6. Click **Update** to save changes
7. Success message appears: "Question updated successfully"

#### Deleting a Question

**Purpose**: Remove an outdated or incorrect FAQ

**Steps**:
1. Navigate to **Manage Questions**
2. Locate the question to delete
3. Click the **Delete icon** (trash) in the Actions column
4. A confirmation dialog appears
5. Click **Delete** to confirm
6. Success message appears: "Question deleted successfully"

> **Warning**: This action cannot be undone. The question is permanently removed.

#### Viewing a Question

**Purpose**: Preview how a question appears to regular users

**Steps**:
1. Navigate to **Manage Questions**
2. Click the **View icon** (eye) in the Actions column
3. You are redirected to the Question Detail page

### Workflow 2: Managing Users

Administrators can create, edit, and delete user accounts.

#### Creating a New User

**Purpose**: Add a new team member to the system

**Steps**:
1. Navigate to **Manage Users** from the sidebar
2. Click the **Add User** button (top-right)
3. Fill in the user form:

| Field | Description | Required |
|-------|-------------|----------|
| Username | Unique login name | Yes |
| Email | User's email address | Yes |
| Password | Login password | Yes |
| Full Name | User's full name | Yes |
| Department | User's department | No |
| Role | User's role (Admin/HR/NOC Engineer) | Yes |

4. Click **Create** to save
5. Success message appears: "User created successfully"

#### Editing a User

**Purpose**: Update user information or reset password

**Steps**:
1. Navigate to **Manage Users**
2. Click the **Edit icon** (pencil) for the user
3. The edit dialog opens with current values
4. Modify fields as needed:
   - To change password: Enter a new password in the password field
   - To keep current password: Leave the password field blank
5. Click **Update** to save
6. Success message appears: "User updated successfully"

#### Deleting a User

**Purpose**: Remove a user's access to the system

**Steps**:
1. Navigate to **Manage Users**
2. Click the **Delete icon** (trash) for the user
3. A confirmation dialog appears
4. Click **Delete** to confirm
5. Success message appears: "User deleted successfully"

> **Warning**: This action cannot be undone. The user is permanently removed.

### Workflow 3: Understanding User Roles

| Role | Dashboard | FAQs | Manage Questions | Manage Users | Session Reports |
|------|-----------|------|-------------------|--------------|-----------------|
| NOC Engineer | ✓ | ✓ | - | - | - |
| HR Manager | ✓ | ✓ | - | - | ✓ |
| Administrator | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Common Tasks

### Task 1: Finding a Solution Quickly

1. Start typing in the search bar
2. Results filter in real-time
3. Click on the most relevant result

### Task 2: Browsing by Category

1. From Dashboard, view category cards
2. Click on a category with many questions
3. Browse the displayed questions

### Task 3: Checking Recent Activity (HR/Admin)

1. Go to Session Reports
2. View the Recent Sessions table
3. Check login times and durations

### Task 4: Adding a New FAQ (Admin)

1. Go to Manage Questions
2. Click Add Question
3. Fill in all required fields
4. Click Create

### Task 5: Onboarding a New User (Admin)

1. Go to Manage Users
2. Click Add User
3. Enter all required information
4. Assign appropriate role
5. Provide credentials to new user

---

## Troubleshooting

### Issue: Cannot Login

**Possible Causes**:
1. Incorrect email or password
2. Account does not exist
3. Account has been deleted

**Solutions**:
- Verify credentials with administrator
- Check if Caps Lock is on
- Contact admin to recreate account

### Issue: Cannot See Manage Questions/Users Menu

**Possible Causes**:
- Your account role is not Administrator

**Solutions**:
- Contact your administrator to upgrade your role

### Issue: Search Returns No Results

**Possible Causes**:
- No matching questions in the database
- Search term spelled differently

**Solutions**:
- Try different keywords
- Browse categories manually
- Ask administrator to add relevant questions

### Issue: Session Reports Empty

**Possible Causes**:
- No users have logged in yet
- Date filter too narrow

**Solutions**:
- Widen the date range
- Wait for users to log in

### Issue: Application Won't Start

**Possible Causes**:
- Ports 3000 or 5000 in use
- Node.js not installed
- Dependencies not installed

**Solutions**:
- Close other applications using those ports
- Install Node.js from nodejs.org
- Run `npm install` in both backend and frontend folders

---

## Appendix: Technical Information

### System Requirements
- **Browser**: Chrome, Firefox, Edge, or Safari (latest versions)
- **Node.js**: Version 14 or higher
- **MongoDB**: Running locally or remote connection

### Default Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/noc-faqs

### Database Collections
- `users` - User accounts
- `questions` - FAQ entries
- `sessions` - Login session records

---

## Support

For technical support or questions about this system:
- Contact your system administrator
- Check the server logs in the terminal windows
- Review this training manual

---

*Document Version: 1.0*
*Last Updated: February 2026*
