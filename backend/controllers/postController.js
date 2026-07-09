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

const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.author) {
            filter.author = req.query.author;
        }

        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);
        const hasNextPage = page < totalPages;

        const posts = await Post.find(filter)
            .populate("author", postAuthorFields)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts,
            hasNextPage
        });
    } catch (error) {
        next(error);
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

const toggleLikePost = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        // Try to unlike (pull) if user has already liked it
        let post = await Post.findOneAndUpdate(
            { _id: postId, likes: userId },
            { $pull: { likes: userId } },
            { new: true }
        );

        let liked = false;
        if (!post) {
            // If the user hadn't liked it (post is null), perform like (addToSet)
            post = await Post.findOneAndUpdate(
                { _id: postId },
                { $addToSet: { likes: userId } },
                { new: true }
            );
            liked = true;
        }

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json({
            message: liked ? "Post liked successfully" : "Post unliked successfully",
            likes: post.likes
        });
    } catch (error) {
        next(error);
    }
};

const searchPosts = async (req, res, next) => {
    try {
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = query ? { content: { $regex: query, $options: "i" } } : {};

        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);
        const hasNextPage = page < totalPages;

        const posts = await Post.find(filter)
            .populate("author", postAuthorFields)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages,
            totalPosts,
            hasNextPage
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPost,
    getPosts,
    deletePost,
    toggleLikePost,
    searchPosts
};
