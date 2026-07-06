const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
    createPost,
    getPosts,
    deletePost,
    toggleLikePost
} = require("../controllers/postController");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLikePost);

module.exports = router;
