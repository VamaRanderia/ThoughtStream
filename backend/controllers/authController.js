const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const registerUser = async (req, res) => {
    try {

        const { username, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
}
    const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
    return res.status(401).json({
        message: "Invalid credentials"
    });
}
    const token = generateToken(user._id);
    res.status(200).json({
    message: "Login successful",
    token
});
    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    registerUser,
    loginUser
};