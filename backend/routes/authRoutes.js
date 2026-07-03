const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    checkEmailAvailability,
    checkUsernameAvailability
} = require("../controllers/authController");

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/check-email", checkEmailAvailability);
router.get("/check-username", checkUsernameAvailability);

module.exports = router;