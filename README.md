# Smart Attendance Management System

**A Comprehensive Digital Ecosystem for Academic Accountability**

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🏛️ Project Overview

This project was developed as a modern, full-stack **Smart Attendance Management System** specifically tailored for **Pt. Mahaveer Prasad Tripathi PG College**. It transitions traditional, manual attendance tracking into a secure, automated, and highly analytical digital platform.

The system aims to eliminate proxy attendance, reduce administrative overhead for faculty, and provide students with transparent, real-time insights into their academic engagement.

## ✨ Core Features & Modules

### 1. Administrative Control Panel (Admin)
- **Centralized Dashboard**: Real-time metrics on total enrollment, active faculty, and course offerings.
- **Entity Management**: Full CRUD operations for managing student directories, faculty profiles, and departmental subjects.
- **Audit Logging**: Comprehensive system logs to ensure data integrity and track administrative actions.

### 2. Faculty Academic Portal (Teacher)
- **Session Management**: Dynamic selection of subjects and respective classes.
- **Dual-Mode Attendance Tracking**:
  - **Manual Override**: Traditional roster-based marking (Present, Absent, Late).
  - **Dynamic QR Synchronization**: Generation of time-sensitive, encrypted QR codes for students to scan in real-time, drastically reducing class setup time.

### 3. Student Engagement Dashboard (Student)
- **Interactive Scanning**: Built-in QR scanner utilizing the device's camera to securely mark attendance within the classroom.
- **Visual Analytics**: Interactive pie charts and bar graphs detailing overall attendance ratios and subject-wise breakdown.
- **Historical Records**: Immediate access to recent attendance logs for personal verification.

## 🛠️ System Architecture

The application follows a standard **Client-Server Architecture** utilizing the MERN stack:

- **Frontend (Client)**: Built with React.js. Utilizes Context API for state management, Tailwind CSS (v4) for institutional-grade responsive styling, and Framer Motion for fluid transitions. Data visualization is powered by Recharts.
- **Backend (Server)**: Engineered with Node.js and Express.js, following the MVC (Model-View-Controller) design pattern. Secured with JWT (JSON Web Tokens) for role-based authorization and Bcrypt for password hashing.
- **Database**: MongoDB (Atlas) serves as the NoSQL database, structured with Mongoose ORM to enforce strict data schemas and relationships between Users, Subjects, and Attendance records.

## 🚀 Installation & Deployment Guide

To run this project locally for evaluation purposes, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v16.x or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/VimleshKumar884/Smart-Attendance-Management-System---Pt.-Mahaveer-Prasad-Tripathi-PG-College.git
cd Smart-Attendance-Management-System---Pt.-Mahaveer-Prasad-Tripathi-PG-College
```

### 2. Backend Initialization
```bash
cd backend
npm install
```
Configure your environment variables by creating a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/smart_attendance
JWT_SECRET=your_secure_jwt_secret
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Initialization
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173` (or `http://localhost:5174`).

## 🔑 Evaluation Credentials

The database has been pre-seeded with sample data to facilitate immediate testing of the various user roles.

| Access Level | Official Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `password123` |
| **Faculty Member** | `sarah@college.edu` | `password123` |
| **Student** | `ankit@student.edu` | `password123` |

---
*Submitted for Academic Evaluation.*