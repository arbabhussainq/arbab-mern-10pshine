# Noted - A Modern Notes Application

A full-stack notes application built with the MERN stack (MongoDB, Express, React, Node.js) during my internship at **10Pearls**. Noted is a clean, minimal, and feature-rich note-taking app inspired by Notion and Obsidian.

---
## Features

### Notes
- Create, edit, and delete notes with a rich text editor
- Bold, italic, underline, strikethrough, alignment, bullet lists, numbered lists
- Pin notes to keep them at the top
- Mark notes as favourites
- Soft delete, notes go to Trash before permanent deletion
- Restore notes from Trash or permanently delete them
- Empty Trash with one click

### Tags
- Create custom tags with color indicators
- Assign multiple tags to a note
- Filter notes by tag from the sidebar
- Delete tags directly from the sidebar

### Search
- Real-time search across all note titles and content

### Export and Import
- Export all notes as JSON (for reimporting)
- Export all notes as plain text
- Export all notes as a beautifully formatted PDF with cover page and table of contents
- Export a single note as PDF directly from the editor
- Import notes from a JSON file with automatic duplicate detection

### User Profile
- Update display name
- Change password with current password verification
- Member since date shown on profile

### Authentication
- Register and login with JWT authentication
- Forgot password with 6-digit OTP sent to email
- OTP expires in 10 minutes with resend cooldown
- Protected routes, unauthenticated users redirected to login

### Dark and Light Mode
- Toggle between dark and light themes
- Theme persists across sessions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Logging | Pino Logger |
| Email | Nodemailer + Gmail |
| PDF Generation | jsPDF |
| Icons | Lucide React |
| Backend Tests | Mocha + Chai + Supertest |
| Frontend Tests | Vitest + React Testing Library |

---

## Project Structure
```
notes-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, logger, email service
│   │   ├── controllers/     # Auth, notes, tags controllers
│   │   ├── middleware/      # Auth middleware, error handler
│   │   ├── models/          # User, Note, Tag models
│   │   └── routes/          # Auth, notes, tags routes
│   ├── tests/               # Mocha/Chai test suites
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # Auth and Theme context
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Login, Signup, Dashboard, Profile, ForgotPassword
    │   ├── services/        # API service functions
    │   └── tests/           # Vitest test suites
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally
- Gmail account with App Password for OTP emails

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/arbab-mern-10pshine.git
cd arbab-mern-10pshine/notes-app
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup the frontend

```bash
cd ../frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running Tests

### Backend Tests (Mocha + Chai)

```bash
cd backend
npm test
```

Runs 38 tests across 3 test suites:
- Auth API (register, login, forgot password, profile)
- Notes API (CRUD, trash, import, export)
- Tags API (create, get, delete)

### Frontend Tests (Vitest + React Testing Library)

```bash
cd frontend
npm test
```

Runs 50+ tests across 5 test suites:
- Login page
- Signup page
- Forgot Password page
- Profile page
- Auth Context
- Theme Context

---

## Git Branching Strategy

This project follows the **10Pearls MERN branching strategy**:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/backend/<name>` | Backend features |
| `feature/frontend/<name>` | Frontend features |
| `docs/<name>` | Documentation updates |

All features are developed on feature branches and merged into `develop` via Pull Requests.

---

## Developer

**Arbab Hussain Qureshi** - Intern at 10Pearls - MERN Stack Developer -Mehran University of Engineering and Technology (MUET)

---

## Internship

This project was developed as part of the **10pShine Internship Program** at **10Pearls**.