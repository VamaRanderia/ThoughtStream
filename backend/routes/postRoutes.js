const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { validateCreatePost, validateIdParam } = require("../middleware/validationMiddleware");
const {
    createPost,
    getPosts,
    deletePost,
    toggleLikePost
} = require("../controllers/postController");

router.post("/", protect, validateCreatePost, createPost);
router.get("/", protect, getPosts);
router.delete("/:id", protect, validateIdParam, deletePost);
router.post("/:id/like", protect, validateIdParam, toggleLikePost);

module.exports = router;
