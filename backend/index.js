const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');

// Import the summarize route
const summarizeRoute = require('./routes/summarize'); // Add this line

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully!");
    } catch (err) {
        console.log("Database connection error:", err);
    }
};

// Middleware
dotenv.config();
app.use(express.json()); // For parsing JSON data
app.use("/images", express.static(path.join(__dirname, "/images"))); // Serve image files
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // CORS setup for frontend
app.use(cookieParser()); // Cookie parsing middleware

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Add the summarize route
app.use("/api", summarizeRoute); // Add this line to use summarize route

// Image upload setup
const storage = multer.diskStorage({
    destination: (req, file, fn) => {
        fn(null, "images");
    },
    filename: (req, file, fn) => {
        fn(null, req.body.img);
    },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("Image has been uploaded successfully!");
});

// Start the server
app.listen(process.env.PORT, () => {
    connectDB();
    console.log("App is running on port " + process.env.PORT);  
});
