# Kanban Board - Full Stack Application

A production-quality Jira-style Kanban board built with **SolidJS**, **Express.js**, and **MongoDB**. Features drag-and-drop, real-time filtering, JWT authentication, and a beautiful responsive UI.

## 🎬 Demo

![Application Demo](/home/mohammed/.gemini/antigravity/brain/b6db322b-86b6-4141-95fb-06f1723d9bf3/app_walkthrough_1769841054530.webp)

## 📸 Screenshots

### Landing Page
![Landing Page](/home/mohammed/.gemini/antigravity/brain/b6db322b-86b6-4141-95fb-06f1723d9bf3/01_landing_page_1769841064144.png)

### Sign Up Page
![Signup Page](/home/mohammed/.gemini/antigravity/brain/b6db322b-86b6-4141-95fb-06f1723d9bf3/02_signup_page_1769841105831.png)

---

## ✨ Features

### Core Features
- **📋 Kanban Board** - 5 customizable columns (Backlog, To Do, In Progress, Review, Done)
- **🎯 Drag & Drop** - Custom implementation without external libraries
- **🔍 Search & Filter** - Real-time search and priority filtering
- **📝 Task Management** - Create, edit, delete tasks with rich details
- **🏷️ Labels & Priority** - Color-coded priority indicators and custom labels
- **👥 User Assignment** - Assign tasks to team members
- **💬 Comments** - Add and view comments on tasks
- **📅 Due Dates** - Visual indicators for overdue tasks

### Authentication
- **🔐 JWT Authentication** - Secure token-based authentication
- **📝 User Registration** - Create new accounts with email/password
- **🔑 Login/Logout** - Session management with localStorage persistence

### UI/UX
- **🎨 Modern Design** - Glassmorphism, gradients, animations
- **📱 Responsive** - Works on desktop and mobile
- **♿ Accessible** - ARIA labels, keyboard navigation, screen reader support
- **🌙 Dark Theme** - Beautiful dark mode interface

---

## 🛠️ Tech Stack

### Frontend
- **SolidJS** - Reactive UI framework
- **@solidjs/router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS** - Custom design system with CSS variables

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd solidJS
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Configure environment variables**

Create `.env` in the root folder (frontend):
```env
VITE_API_URL=http://localhost:5000/api
```

Create `.env` in the server folder (backend):
```env
MONGODB_URI=mongodb://localhost:27017/kanban
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

5. **Start MongoDB** (if running locally)
```bash
mongod
```

6. **Start the backend server**
```bash
cd server
npm run dev
```

7. **Start the frontend** (in a new terminal)
```bash
npm run dev
```

8. **Open the application**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
solidJS/
├── server/                # Backend API
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── models/
│   │   ├── Board.js       # Board schema
│   │   ├── Task.js        # Task schema
│   │   └── User.js        # User schema
│   ├── routes/
│   │   ├── auth.js        # Auth endpoints
│   │   ├── boards.js      # Board CRUD
│   │   └── tasks.js       # Task CRUD
│   └── index.js           # Server entry
│
├── src/                   # Frontend
│   ├── components/
│   │   ├── Board/         # Main board
│   │   ├── Column/        # Column component
│   │   ├── TaskCard/      # Task card
│   │   ├── TaskModal/     # Task detail modal
│   │   ├── FilterBar/     # Search & filters
│   │   └── common/        # Reusable components
│   ├── pages/
│   │   ├── Landing.jsx    # Landing page
│   │   ├── Login.jsx      # Login page
│   │   ├── Signup.jsx     # Signup page
│   │   └── BoardPage.jsx  # Board page
│   ├── store/
│   │   ├── authStore.js   # Auth state
│   │   └── kanbanStore.js # Board state
│   ├── styles/
│   │   ├── variables.css  # Design tokens
│   │   ├── global.css     # Global styles
│   │   ├── pages/         # Page styles
│   │   └── components/    # Component styles
│   └── utils/
│       ├── api.js         # API client
│       ├── accessibility.js
│       └── helpers.js
│
├── package.json
└── vite.config.js
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get user's boards |
| GET | `/api/boards/:id` | Get board with tasks |
| POST | `/api/boards` | Create board |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/board/:id` | Get tasks by board |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/move` | Move task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between elements |
| `Enter` / `Space` | Activate element |
| `Escape` | Close modal |
| `Ctrl + Arrow` | Move selected task |

---

## 🧪 Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test
```

---

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Start production server
cd server && npm start
```

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
