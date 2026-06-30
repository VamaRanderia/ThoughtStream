const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    bio: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: ""
    },

    profilePicture: {
        type: String,
        default: ""
    },

    isProfileComplete: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);