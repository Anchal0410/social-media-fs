const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const fs = require('fs');
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
} else {
    console.log('Uploads directory exists');
} 


const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://social-media-fs-trhn.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//Testing
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        files: req.files
    });
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: err.message 
    });
  });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-submissions', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB.');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const upload = multer({ storage: storage });

// Models
const userSubmissionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    socialHandle: { type: String, required: true },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const UserSubmission = mongoose.model('UserSubmission', userSubmissionSchema);
const Admin = mongoose.model('Admin', adminSchema);



// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    } 

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}; 

// Routes


// Testing
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  
// Create initial admin user route 
app.post('/api/setup-admin', async (req, res) => {
    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({ username: 'admin' });
        
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create new admin 
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new Admin({
            username: 'admin',
            password: hashedPassword
        });

        await admin.save();
        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin user' });
    }
});

// Admin login route 
app.post('/api/admin/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;

        // Find admin user
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        
        if (!isValidPassword) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Submit user data with images
app.post('/api/submit', upload.array('images', 5), async (req, res) => {
    console.log("/api/submit endpoint was called")
    try {
        const { name, socialHandle } = req.body;
        const images = req.files.map(file => file.path);
        
        const submission = new UserSubmission({
            name,
            socialHandle,
            images
        });

        await submission.save();
        res.status(201).json({ message: 'Submission successful', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error saving submission', error: error.message });
    }
});

// Get all submissions (protected route)
app.get('/api/submissions', authenticateToken, async (req, res) => {
    console.log("/api/submission endpoint was called")
    try {
        const submissions = await UserSubmission.find().sort({ createdAt: -1 });
        res.json(submissions);
        console.log("/api/submissions is wokring!");
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
}); 

// Delete submission (protected route)

app.delete('/api/submissions/:id', authenticateToken, async (req, res) => {
    try {
        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid submission ID format' 
            });
        }

        const submission = await UserSubmission.findById(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                message: 'Submission not found' 
            });
        }

        // Delete associated images
        if (submission.images && Array.isArray(submission.images)) {
            for (const imagePath of submission.images) {
                try {
                    const fullPath = path.join(__dirname, imagePath);
                    // Using synchronous version for simplicity
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log('Successfully deleted image:', fullPath);
                    }
                } catch (fileError) {
                    console.warn(`Warning: Failed to delete file: ${imagePath}`, fileError);
                    // Continue with other deletions even if one fails
                }
            }
        }

        // Delete the submission from database
        await UserSubmission.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Submission deleted successfully',
            id: req.params.id
        });

    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting submission', 
            error: error.message 
        });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
