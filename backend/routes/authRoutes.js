const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getCurrentUser,
    checkEmailAvailability,
    checkUsernameAvailability
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.get("/check-email", checkEmailAvailability);
router.get("/check-username", checkUsernameAvailability);

module.exports = router;
