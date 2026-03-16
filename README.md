# 🎓 Internship Placement Portal

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4.svg?logo=tailwindcss)

A comprehensive, centralized platform connecting **Students, Companies, Placement Heads, and Administrators** for seamless internship and job placements.

[Report Bug](https://github.com/SACHIN-P45/Internship_Placement_Portal/issues) • [Request Feature](https://github.com/SACHIN-P45/Internship_Placement_Portal/issues)

</div>

---

## ✨ Key Features

The portal provides tailored experiences for four distinct user roles, ensuring efficient operations at every level.

### 👨‍🎓 For Students
- **Smart Profile:** Upload resumes, update CGPA, and list skills.
- **Job Discovery & Bookmarks:** Browse categorized internship and job opportunities and save favorites.
- **Skill Matching Algorithms:** Receive real-time job recommendations based on profile skills.
- **Application Tracking:** Monitor application statuses (Applied, Shortlisted, Selected, Rejected).

### 🏢 For Companies
- **Job Posting:** Create detailed internship/job listings with specific eligibility criteria.
- **Applicant Management:** Review student profiles, download PDFs/resumes directly.
- **Status Updates:** Update candidate application statuses; triggers automated email notifications to students.

### 👔 For Placement Heads
- **Advanced Analytics:** Interactive dashboards showing department-wise placement statistics.
- **Salary Analytics:** View the highest, lowest, and average CTC packages across departments.
- **Job Control:** Ability to instantly activate or deactivate job postings across the portal.
- **PDF Reports:** Generate detailed, formatted placement reports.

### 🛡️ For Administrators
- **User Management:** Oversee entire user base, block/unblock accounts.
- **Company Approvals:** Vet and approve pending company registrations before they can post jobs.
- **System Health:** View high-level portal statistics.

---

## 🛠️ Technology Stack

| Architecture | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, React Router, React Toastify |
| **Styling** | Vanilla CSS, Tailwind CSS (for structure elements), Glassmorphism UI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ORM |
| **Authentication**| JWT (JSON Web Tokens), Passport.js (Google & GitHub OAuth) |
| **File Storage** | Multer (PDF Resume processing) |
| **Mailing** | Nodemailer (Emails for application status, reset password, etc.) |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.14.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster URI)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/SACHIN-P45/Internship_Placement_Portal.git
cd Internship_Placement_Portal
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Duplicate the .env.example file or create a new .env file with:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_strong_secret
FRONTEND_URL=http://localhost:3001
CLIENT_URL=http://localhost:3001

# OAuth & Email Configurations
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret

# Admin Seeder Credentials (Initial Setup)
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=admin_password
PH_EMAIL=placementhead@portal.com
PH_PASSWORD=ph_password

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal instance and navigate to the client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will start running on `http://localhost:3001` and the API will be accessible at `http://localhost:5000`.

---

## 📁 Project Structure

```text
Internship_Placement_Portal/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, Loaders)
│   │   ├── context/            # React Context API (AuthContext)
│   │   ├── pages/              # Route pages (Dashboards, Job Listings, etc.)
│   │   ├── services/           # Axios API call wrappers
│   │   ├── App.jsx             # Main Router structure
│   │   └── index.css           # Global Custom Styles & Glassmorphism
│   └── vercel.json             # Vercel deployment configuration
│
└── server/                     # Backend API & Database
    ├── config/                 # DB connections & Passport OAuth strategies
    ├── controllers/            # Route logic & Business logic
    ├── middleware/             # Express Middlewares (Auth check, Role check, Multer)
    ├── models/                 # Mongoose Database Schemas
    ├── routes/                 # API endpoint routing
    ├── utils/                  # Helpers (Email service, JWT generator, Schedulers)
    └── server.js               # Express Server Entry Point
```

---

## 🔒 Security Measures
- **Role-Based Authorization:** Strict middleware guards preventing vertical privilege escalation.
- **Secure File Uploads:** Validates both MimeTypes and file extensions to block malicious scripts (strictly `.pdf`).
- **Data Protection:** Hashed passwords using `bcryptjs` and HTTP-only cookie-based handoffs for OAuth flows.
- **Rate Limiting:** Protects `/api/auth/login` from Brute Force attacks.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Developed with ❤️ for streamlined campus placements.</i>
</div>
