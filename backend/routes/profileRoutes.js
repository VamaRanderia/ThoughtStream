const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/profileController");

router.put("/", protect, updateProfile);

module.exports = router;