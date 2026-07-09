const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { updateProfile, getProfile, getProfilePosts } = require("../controllers/profileController");
const { uploadSingle } = require("../middleware/uploadMiddleware");

router.put("/", protect, uploadSingle, updateProfile);
router.get("/", protect, getProfile);
router.get("/posts", protect, getProfilePosts);

module.exports = router;