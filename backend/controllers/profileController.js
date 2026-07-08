const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "thoughtstream_profiles"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary delete error:", err);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { bio, location, removePicture } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Handle profile picture removal
        if (removePicture === "true") {
            if (user.profilePicturePublicId) {
                await deleteFromCloudinary(user.profilePicturePublicId);
            }
            user.profilePicture = "";
            user.profilePicturePublicId = "";
        } 
        // Handle profile picture upload
        else if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer);
                
                // If there's an existing picture, delete it from Cloudinary
                if (user.profilePicturePublicId) {
                    await deleteFromCloudinary(user.profilePicturePublicId);
                }
                
                user.profilePicture = result.secure_url;
                user.profilePicturePublicId = result.public_id;
            } catch (uploadError) {
                return res.status(500).json({
                    message: `Failed to upload image to Cloudinary: ${uploadError.message}`
                });
            }
        }

        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;

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