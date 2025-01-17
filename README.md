# Social Media Task

A full-stack web application that allows users to submit their information with images and provides an admin dashboard to manage submissions.

## Features

### User Submission
- User-friendly form for data submission
- Multiple image upload capability
- Real-time image preview
- Success/error notifications with auto-dismiss
- Form validation

### Admin Dashboard
- Secure admin login system
- View all user submissions
- View full-size images
- Delete submissions
- Auto-refresh data
- Secure logout functionality

## Tech Stack
### Frontend
- React.js
- Tailwind CSS for styling
- Responsive design
- Local storage for auth token management

### Backend
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- Multer for file uploads

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/submission-system.git
cd submission-system
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create a `.env` file in the backend directory
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user-submissions
JWT_SECRET=your-secret-key
```

## Running the Application

1. Start MongoDB
```bash
# Windows
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe"

# Mac/Linux
mongod
```

2. Start the backend server
```bash
cd server
node server.js
```

3. Start the frontend application
```bash
cd client
npm start
```

4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
