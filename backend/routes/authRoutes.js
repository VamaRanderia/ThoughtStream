const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    checkEmailAvailability
} = require("../controllers/authController");

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/check-email", checkEmailAvailability);

module.exports = router;