# Internship Placement Portal

A comprehensive portal for managing internship and job placements across the institution.

## 🌟 Features
- **Role-based Dashboards:** Dedicated experiences for Admin, Placement Head, Company, and Student.
- **Job & Application Management:** End-to-end tracking of job listings and student applications.
- **OAuth Integrations:** Secure login supporting Google and GitHub.
- **Reporting & Analytics:** Generate detailed placement reports and performance statistics in PDF format.
- **Communication:** Automated email notifications for job updates and password resets.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** Passport.js (JWT, Google OAuth, GitHub OAuth)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SACHIN-P45/Internship_Placement_Portal.git
   cd Internship_Placement_Portal
   ```

2. Install Server Dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install Client Dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Configuration
1. In the `server` directory, duplicate `.env.example` as `.env`.
2. Fill in the required environment variables:
   - MongoDB Connection String
   - JWT Secret
   - OAuth Credentials (Google/GitHub)
   - Email App Password

### Running the Application

1. **Start the Backend Server (from the `server` folder):**
   ```bash
   npm run dev
   ```

2. **Start the Frontend Application (from the `client` folder):**
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
