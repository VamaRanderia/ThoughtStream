const User = require("../models/User");

const updateProfile = async (req, res) => {

    try {

        const { bio, location, profilePicture } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.bio = bio;
        user.location = location;
        user.profilePicture = profilePicture;

        user.isProfileComplete = true;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    updateProfile
};