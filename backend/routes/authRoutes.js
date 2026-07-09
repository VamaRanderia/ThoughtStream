const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    checkEmailAvailability,
    checkUsernameAvailability
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { validateSignup, validateLogin } = require("../middleware/validationMiddleware");

router.post("/signup", validateSignup, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);
router.get("/check-email", checkEmailAvailability);
router.get("/check-username", checkUsernameAvailability);

module.exports = router;
