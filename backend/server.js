require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const protect = require("./middleware/authMiddleware");

const userRoutes = require("./routes/userRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Main App API Routing Tables
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.put("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.get("/profile", protect, (req, res) => {
    res.json({
        message: "Protected Route",
        user: req.user
    });
});

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    });