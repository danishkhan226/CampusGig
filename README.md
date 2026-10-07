# CampusGig 🎓

**CampusGig** is a student-focused freelance marketplace that connects college students who want to **offer their skills and earn** with students looking to **hire affordable services** for their projects and needs.

## 🌐 Live Demo

**Frontend:** [CampusGig Live Website](https://campusgig-frontend-liard.vercel.app?utm_source=chatgpt.com)

**Backend API:** [CampusGig Backend API](https://campusgig-backend.vercel.app/api?utm_source=chatgpt.com)

## 🚀 Features

* Student registration and authentication
* Freelancer profiles and portfolios
* Create and manage freelance services
* Browse and search available services
* Service categories and filters
* Order and project management
* Secure online payments
* Real-time chat between clients and freelancers
* Ratings and reviews
* Student verification
* Notifications
* Admin dashboard for platform management

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT
* HTTP-only Cookies
* bcrypt

### Other Services

* Socket.io
* Cloudinary
* Razorpay

## 📂 Project Structure

```text
CampusGig/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       └── utils/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
│
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB or a MongoDB Atlas account
* Git

### Clone the Repository

```bash
git clone https://github.com/danishkhan226/CampusGig.git
cd CampusGig
```

### Install Dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

### Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

GEMINI_API_KEY=
```

Never commit your `.env` file to GitHub.

### Run the Application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## 🔄 Platform Workflow

```text
Student
   ↓
Create Profile
   ↓
Create / Browse Services
   ↓
Hire a Freelancer
   ↓
Place Order
   ↓
Payment
   ↓
Work Delivery
   ↓
Approval
   ↓
Rating & Review
```

## 🎯 Project Goals

* Create a dedicated marketplace for student freelancers.
* Help students monetize their skills and gain practical experience.
* Provide affordable services to students.
* Help freelancers build portfolios and credibility.
* Provide a secure and organized way to manage freelance projects.

## 🔮 Future Improvements

* AI-powered service recommendations
* AI-generated service descriptions
* Advanced freelancer matching
* Mobile application
* College-specific marketplaces
* Advanced analytics
* Automated dispute resolution

## 👨‍💻 Author

**Danish Khan**

---

⭐ If you find this project useful, consider giving it a star.
