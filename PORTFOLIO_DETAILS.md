# Portfolio Project Details: SolidBoard

Use the following information to add **SolidBoard** to the portfolio website. These details are optimized to highlight technical depth, modern framework expertise (SolidJS), and full-stack capabilities to attract recruiters.

## 📂 Project Assets
The screenshots for this project are located in your portfolio's public folder at: `/public/solid-board/`

**Recommended Image Mapping:**
- **Thumbnail / Main Image:** `tasks-lists-1.png` (Shows the populated Kanban board, high visual impact)
- **Gallery Image 1:** `board-lists-1.png` (Shows the dashboard/workspace view)
- **Gallery Image 2:** `tasks-list-1-with-filter.png` (Demonstrates advanced filtering capabilities)
- **Gallery Image 3:** `tasks-list-2.png` (Shows task details or alternative view)

---

## 🚀 Project Overview

**Name:** SolidBoard
**Tagline:** High-Performance Kanban Project Management
**Live Demo:** [Link to deployment if available, else omit]
**GitHub:** [Link to repo]

**Short Description (for cards/previews):**
> A production-grade, Jira-style Kanban application built with **SolidJS** and **Node.js**. Features a high-performance drag-and-drop interface, real-time state management, and a glassmorphic design system.

**Full Description (for details page):**
> SolidBoard is a modern project management tool designed for speed and usability. Built to demonstrate the power of **fine-grained reactivity**, it leverages **SolidJS** on the frontend to deliver a smooth, lag-free experience even with complex state updates.
>
> Unlike traditional React applications that rely on Virtual DOM diffing, SolidBoard updates the DOM directly, resulting in exceptional performance. The application supports multiple workspaces (boards), fully customizable workflows (columns), and rich task management features like priorities, tags, and due dates.
>
> The backend is a robust RESTful API built with **Express** and **MongoDB**, featuring secure **JWT authentication**, complex data aggregation for board statistics, and efficient schema design to handle relational data within a NoSQL environment.

---

## 🛠 Tech Stack

**Frontend:**
- **SolidJS**: For fine-grained, high-performance reactivity without a Virtual DOM.
- **Solid Router**: For seamless client-side navigation.
- **Vite**: For next-generation tooling and optimized builds.
- **CSS3 / Glassmorphism**: Custom-built design system with translucent UI elements, gradients, and responsive layouts (Mobile/Tablet/Desktop).

**Backend:**
- **Node.js & Express**: Scalable REST API architecture.
- **MongoDB & Mongoose**: Flexible schema design with relationships between Boards, Columns, Tasks, and Users.
- **JWT (JSON Web Tokens)**: Secure, stateless authentication mechanism.
- **BcryptJS**: For secure password hashing.

---

## ✨ Key Features (Recruiter Highlights)

1.  **🚀 Performance-First Architecture**: Utilizes SolidJS's compiled reactivity to ensure O(1) updates, completely eliminating wasted renders common in React applications.
2.  **🖱️ Intuitive Drag-and-Drop**: Custom-implemented drag-and-drop logic for moving tasks between columns and reordering them, providing a native-app feel.
3.  **🧩 Comprehensive State Management**: Uses SolidJS Stores (`createStore`) for managing complex nested state (boards -> columns -> tasks) with deep reactivity.
4.  **🔍 Advanced Filtering & Search**: Real-time filtering of tasks by multiple criteria (priority, tags, search text) using derived signals (`createMemo`) for instant feedback.
5.  **🎨 Responsive Glassmorphism UI**: A fully responsive design that adapts to all screen sizes, featuring a modern aesthetic with backdrop filters, translucent layers, and smooth CSS transitions.
6.  **🔐 Secure Authentication**: Full sign-up/login flow with JWT-based session management and protected API routes.
7.  **🛠️ Customizable Workflows**: Users can create dynamic columns, rename boards/columns, and tailor the board structure to their specific project needs (Scrum, Kanban, or custom).

---

## 💡 Challenges Solved (Storytelling for Interviews)

-   **State Synchronization**: syncing the local optimistic UI state with the backend database during rapid drag-and-drop operations to ensure data consistency without UI jank.
-   **Complex Filtering**: Implementing a multi-criteria filter system that efficiently updates the view without re-rendering the entire board, leveraging SolidJS's `createMemo`.
-   **Mobile Responsiveness**: Adapting a wide, horizontal Kanban layout for mobile devices using CSS Grid/Flexbox and touch-friendly interactions.
