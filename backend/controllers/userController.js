const mongoose = require("mongoose");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

// Reusable helper pipeline for fetching users with their relationship status
const getUserRelationsPipeline = (loggedInUserId, filter, skip, limit) => {
    return [
        { $match: filter },
        {
            $lookup: {
                from: "friendrequests",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $or: [
                                            { $and: [{ $eq: ["$sender", new mongoose.Types.ObjectId(loggedInUserId)] }, { $eq: ["$receiver", "$$userId"] }] },
                                            { $and: [{ $eq: ["$receiver", new mongoose.Types.ObjectId(loggedInUserId)] }, { $eq: ["$sender", "$$userId"] }] }
                                        ]
                                    },
                                    { $in: ["$status", ["pending", "accepted"]] }
                                ]
                            }
                        }
                    }
                ],
                as: "relation"
            }
        },
        {
            $addFields: {
                relation: { $arrayElemAt: ["$relation", 0] }
            }
        },
        {
            $addFields: {
                status: {
                    $cond: {
                        if: { $not: ["$relation"] },
                        then: "send",
                        else: {
                            $cond: {
                                if: { $eq: ["$relation.status", "accepted"] },
                                then: "friend",
                                else: {
                                    $cond: {
                                        if: { $eq: ["$relation.sender", new mongoose.Types.ObjectId(loggedInUserId)] },
                                        then: "sent",
                                        else: "received"
                                    }
                                }
                            }
                        }
                    }
                },
                requestId: "$relation._id"
            }
        },
        {
            $project: {
                relation: 0,
                password: 0,
                email: 0,
                __v: 0
            }
        },
        { $sort: { username: 1 } },
        { $skip: skip },
        { $limit: limit }
    ];
};

const getAllUsers = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = { _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) } };

        // 1. Get total count for pagination metadata
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

        // 2. Aggregate users with their friend request relation status
        const usersWithStatus = await User.aggregate(
            getUserRelationsPipeline(loggedInUserId, filter, skip, limit)
        );

        res.status(200).json({
            users: usersWithStatus,
            currentPage: page,
            totalPages,
            totalUsers,
            hasNextPage: page < totalPages
        });
    } catch (error) {
        next(error);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(200).json({
                users: [],
                currentPage: page,
                totalPages: 0,
                totalUsers: 0,
                hasNextPage: false
            });
        }

        // Filter out logged-in user and search by username regex
        const filter = {
            _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) },
            username: { $regex: query, $options: "i" }
        };

        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

        const usersWithStatus = await User.aggregate(
            getUserRelationsPipeline(loggedInUserId, filter, skip, limit)
        );

        res.status(200).json({
            users: usersWithStatus,
            currentPage: page,
            totalPages,
            totalUsers,
            hasNextPage: page < totalPages
        });
    } catch (error) {
        next(error);
    }
};

const getFriends = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Find all accepted friend requests involving this user
        const friendRequests = await FriendRequest.find({
            $or: [
                { sender: loggedInUserId },
                { receiver: loggedInUserId }
            ],
            status: "accepted"
        });

        // Extract friend IDs
        const friendIds = friendRequests.map(request => 
            request.sender.toString() === loggedInUserId ? request.receiver : request.sender
        );

        const totalFriends = friendIds.length;
        const totalPages = Math.ceil(totalFriends / limit);

        // Fetch user profiles for these friends with pagination
        const friendsPaginatedIds = friendIds.slice(skip, skip + limit);
        const friends = await User.find(
            { _id: { $in: friendsPaginatedIds } },
            "username profilePicture bio location portfolioUrl"
        ).sort({ username: 1 });

        const friendsWithStatus = friends.map(friend => {
            const request = friendRequests.find(r => 
                (r.sender.toString() === friend._id.toString() || r.receiver.toString() === friend._id.toString())
            );
            return {
                ...friend.toObject(),
                status: "friend",
                requestId: request ? request._id : undefined
            };
        });

        res.status(200).json({
            friends: friendsWithStatus,
            currentPage: page,
            totalPages,
            totalFriends,
            hasNextPage: page < totalPages
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    searchUsers,
    getFriends,
    getUserById
};
