const express = require("express");
const { getAllUsers, searchUsers, getUserById } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;