# 🎓 منصّتي (Mansaty) — Modern Full-Stack Education & LMS Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react)](https://react.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154?logo=reactquery)](https://tanstack.com/query)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A production-ready, feature-rich Arabic Educational & Learning Management System (LMS) built with **Next.js 16 (App Router)**, **React 19**, **TanStack Query v5**, **Node.js/Express**, and **MongoDB Atlas**.
> Designed with native **RTL Arabic typography**, handcrafted **CSS Modules**, glassmorphism micro-interactions, full anti-cheat **Quiz Engine**, and a cryptographically verifiable **Certificate Verification System**.

---

## ⚡ Live Demo Credentials (للتجربة السريعة)

You can explore the platform with these pre-seeded demo accounts:

| Role | Email | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **👑 Admin (المشرف)** | `admin@platform.com` | `admin123456` | Full CRUD on courses, manage curriculum/lessons, create/edit quizzes, review student enrollments & platform analytics. |
| **🎓 Student (الطالب)** | `student@platform.com` | `student123456` | Browse courses, enroll, track lesson progress, take quizzes with timer, earn and print verifiable certificates. |

---

## 🚀 Key Features & Architectural Highlights

### 1. ⚡ Server-State & Architecture (TanStack Query v5)
- Centralized `QueryClient` configuration with hydration safety and query caching.
- Normalized query keys and dedicated domain hooks (`useCourses`, `useQuizzes`, `useCertificates`, `useEnrollments`).
- Targeted cache invalidations and rollback-safe mutations for high performance and zero redundant network calls.

### 2. 🔐 Enterprise Authentication & Role-Based Authorization
- **JWT + HTTP-Only Cookies** architecture with `SameSite=None; Secure=true` for seamless cross-domain deployments.
- Role-based route protection (`ADMIN`, `USER`) preventing unprivileged access.
- Global authentication state synchronized via **Zustand** and validated on-load with `/auth/me`.

### 3. 📝 Interactive Quiz Engine (Anti-Cheat)
- Timed multi-choice evaluations with automated grading and passing score criteria.
- **Server-side answer withholding**: Correct options are stripped from non-admin responses until submission to prevent inspecting answers.
- Comprehensive attempt history and score logging per student.

### 4. 📜 Cryptographic Certificate Issuance & Public Verification
- Automated certificate issuance triggered only when **100% of lessons are completed** and **the quiz is passed**.
- Unique verifiable serial code (e.g. `MC-XXXXX`).
- **Public Verification Page (`/verify-certificate`)**: Open page for employers/recruiters to verify credentials in real-time.
- Print-to-PDF layout with official watermarks and signatures.

### 5. 🎬 Modern LMS Course Player & Progress Tracking
- Sectioned curriculum drawer with preview capabilities for unregistered visitors.
- Real-time lesson progress toggling and dynamic completion percentage calculation.
- Support for video embeds and downloadable course resource attachments.

### 6. 🎨 Handcrafted Design System & RTL Aesthetics
- 100% pure **CSS Modules** architecture engineered specifically for Arabic Cairo & Alexandria typography.
- Glassmorphism, 3D perspective transforms, and mobile-first responsive breakpoints.

---

## 🛠️ Tech Stack Breakdown

### Frontend:
- **Framework:** Next.js 16 (Turbopack, Partial Prerendering, App Router)
- **Library:** React 19
- **Server-State Management:** TanStack Query (React Query v5)
- **Client-State Management:** Zustand 5
- **Styling:** CSS Modules with CSS Variables & Glassmorphism Design System
- **Icons:** Lucide React
- **HTTP Client:** Axios with Credentials Interceptors

### Backend:
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) + Cookie-Parser + Bcrypt
- **File Uploads:** Multer with disk storage categorization and extension filters
- **CORS:** Multi-origin dynamic verification with credentials support

---

## 📂 Project Structure

```bash
project-node.js-fullstack/
├── back-end/
│   ├── controllers/      # Course, Quiz, Certificate, Auth, Enrollment, Review
│   ├── middleware/       # Auth token verification, Multer upload engine
│   ├── models/           # Mongoose schemas (User, Course, Quiz, Certificate, etc.)
│   ├── routes/           # REST API endpoints
│   ├── seed.js           # Database seeder with demo users & courses
│   ├── index.js          # Express app entrypoint & configuration
│   └── package.json
│
├── front-end/
│   ├── src/
│   │   ├── app/          # Next.js App Router (pages & layouts)
│   │   │   ├── courses/          # Catalog, details, learn player, quiz, certificate
│   │   │   ├── dashboard/        # Role-based admin & student views
│   │   │   ├── verify-certificate/ # Public certificate verification
│   │   │   └── globals.css       # Root design tokens & variables
│   │   ├── components/   # Reusable UI components & CSS modules
│   │   ├── hooks/        # React Query hooks (queries & mutations)
│   │   ├── services/     # Axios API service calls
│   │   └── store/        # Zustand global client state
│   └── package.json
│
└── README.md
```

---

## 💻 Local Development Setup

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/education-platform.git
cd education-platform
```

### 2. Setup Backend:
```bash
cd back-end
npm install

# Create .env based on example
cp .env.example .env

# Populate demo data (Admin, Student, Courses, Quizzes)
npm run seed

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

### 3. Setup Frontend:
```bash
cd ../front-end
npm install

# Create .env based on example
cp .env.example .env

# Start Next.js development server
npm run dev
# App will run on http://localhost:3000
```

---

## 🌐 Deployment Guide (Vercel & Render)

### 1. Deploy Backend to [Render.com](https://render.com) (or Railway)
1. Create a new **Web Service** on Render and point it to your GitHub repository.
2. Set **Root Directory** to `back-end`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add the Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URL`: Your MongoDB Atlas connection string.
   - `JWT_SECRET_KEY`: A strong random string.
   - `FRONTEND_URL`: `https://your-app-name.vercel.app`

### 2. Deploy Frontend to [Vercel](https://vercel.com)
1. Import your GitHub repository in Vercel.
2. Set **Root Directory** to `front-end`.
3. Framework Preset: **Next.js**.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL from Render (e.g., `https://your-api.onrender.com`).
5. Click **Deploy**.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

