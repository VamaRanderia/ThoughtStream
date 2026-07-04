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

const cookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

const sendAuthCookie = (res, token) => {
    res.cookie("token", token, cookieOptions());
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const token = generateToken(user._id);
        sendAuthCookie(res, token);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

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
        sendAuthCookie(res, token);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
        message: "Logout successful"
    });
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username email isProfileComplete");

        if (!user) {
            return res.status(401).json({
                message: "Invalid session"
            });
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email parameter is required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        res.status(200).json({
            exists: !!user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                message: "Username parameter is required"
            });
        }

        const user = await User.findOne({ username: username.trim() });

        res.status(200).json({
            exists: !!user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    checkEmailAvailability,
    checkUsernameAvailability
};
