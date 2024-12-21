const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware for handling cookies
const cookieParser = require('cookie-parser');
router.use(cookieParser());

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json("All fields are required!");
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json("User already exists!");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { _id: savedUser._id, username: savedUser.username, email: savedUser.email },
            process.env.SECRET,
            { expiresIn: '3d' }
        );

        const { password: _, ...userInfo } = savedUser._doc; // Exclude password from response

        // Send token as part of the response (for front-end to store in localStorage)
        res.status(200).json({ token, user: userInfo });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json("Email and password are required!");
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json("User not found!");
        }

        // Compare the password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json("Wrong credentials!");
        }

        // Generate JWT
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: '3d' }
        );

        const { password: _, ...info } = user._doc; // Exclude password from response

        // Send token as part of the response (for front-end to store in localStorage)
        res.status(200).json({ token, user: info });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGOUT
router.get('/logout', (req, res) => {
    try {
        res.status(200).json('User logged out successfully!');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REFETCH USER
router.get('/refetch', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json('No token found!');
    }

    jwt.verify(token, process.env.SECRET, {}, (err, data) => {
        if (err) {
            return res.status(403).json('Invalid token!');
        }

        res.status(200).json(data);
    });
});

module.exports = router;
