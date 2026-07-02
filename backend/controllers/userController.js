const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        // Exclude the currently authenticated user from the global directory list
        const users = await User.find(
            { _id: { $ne: req.user.id } },
            "username"
        );

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    getAllUsers
};