const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

// Passport config
// Passport config
require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

// Routes definitions
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const locationRoutes = require('./routes/location');
const uploadRoutes = require('./routes/upload');
const swapKeeperRoutes = require('./routes/swapKeeper');
const addressRoutes = require('./routes/address');
const shortsRoutes = require('./routes/shorts');
const path = require('path');

// CORS Configuration - exact match per requirement
app.use(cors({
    origin: "https://chromavesper.github.io",
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session setup for passport
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// Connect App Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/swapkeeper', swapKeeperRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/shorts', shortsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'CloseKart Backend',
        timestamp: new Date().toISOString()
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'CloseKart API is running' });
});

app.get('/', (req, res) => {
    res.status(200).send('CloseKart Backend is Live');
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
    console.log("Google OAuth Ready:", process.env.GOOGLE_CALLBACK_URL);
});
