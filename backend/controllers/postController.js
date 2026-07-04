const mongoose = require("mongoose");
const Post = require("../models/Post");

const postAuthorFields = "username profilePicture";

const createPost = async (req, res) => {
    try {
        const content = typeof req.body.content === "string"
            ? req.body.content.trim()
            : "";

        if (!content) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                message: "Post content cannot exceed 500 characters"
            });
        }

        const post = await Post.create({
            content,
            author: req.user.id
        });

        const populatedPost = await post.populate("author", postAuthorFields);

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", postAuthorFields)
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deletePost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to delete this post"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    deletePost
};
