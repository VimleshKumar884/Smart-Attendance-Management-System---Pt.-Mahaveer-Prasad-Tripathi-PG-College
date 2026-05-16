# Smart Attendance Management System - Pt. Mahaveer Prasad Tripathi PG College

A modern, full-stack Attendance Management System designed for educational institutions to automate attendance tracking, provide real-time analytics, and enhance security with QR-based and Biometric-ready features.

## 🚀 Features

- **Role-Based Access**: Specialized dashboards for Admins, Teachers, and Students.
- **Admin Panel**: Complete management of students, faculty, subjects, and system settings.
- **Teacher Panel**: Mark attendance manually or generate dynamic QR codes for sessions.
- **Student Dashboard**: Track attendance percentage, view subject-wise breakdown, and scan QR codes.
- **Modern UI/UX**: Built with React, Tailwind CSS, and Framer Motion for a smooth, university-grade experience.
- **Advanced Tech**: JWT authentication, RESTful APIs, and MongoDB for scalable data management.

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion, Recharts.
- **Backend**: Node.js, Express.js, JWT, Bcrypt.
- **Database**: MongoDB (Mongoose).

## 📦 Project Structure

```text
smart-attendance-system/
├── backend/          # Express.js server & MongoDB models
└── frontend/         # React.js application & Tailwind styling
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```
Seed the database with sample data:
```bash
node seed.js
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔑 Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@college.edu | password123 |
| **Teacher** | sarah@college.edu | password123 |
| **Student** | ankit@student.edu | password123 |

---

Developed for **Pt. Mahaveer Prasad Tripathi PG College**.
