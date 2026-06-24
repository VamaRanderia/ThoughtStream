require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();

app.use(express.json());

console.log("URI:", process.env.MONGO_URI);
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

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

app.post("/users", async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json(user);
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

app.listen(5000, () => {
    console.log("Server running on port 5000");
});