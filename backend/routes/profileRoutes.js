const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/profileController");
const { uploadSingle } = require("../middleware/uploadMiddleware");

router.put("/", protect, uploadSingle, updateProfile);

module.exports = router;