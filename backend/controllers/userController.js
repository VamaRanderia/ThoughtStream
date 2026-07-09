const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const users = await User.find(
            { _id: { $ne: loggedInUserId } },
            "username profilePicture"
        );

        const requests = await FriendRequest.find({
            $or: [
                { sender: loggedInUserId },
                { receiver: loggedInUserId }
            ],
            status: { $in: ["pending", "accepted"] }
        });

        const usersWithStatus = users.map((user) => {
            const userObj = user.toObject();
            const relation = requests.find((request) => {
                const senderId = request.sender.toString();
                const receiverId = request.receiver.toString();
                const userId = user._id.toString();

                return (
                    (senderId === loggedInUserId && receiverId === userId) ||
                    (receiverId === loggedInUserId && senderId === userId)
                );
            });

            if (!relation) {
                return {
                    ...userObj,
                    status: "send"
                };
            }

            if (relation.status === "accepted") {
                return {
                    ...userObj,
                    status: "friend",
                    requestId: relation._id
                };
            }

            return {
                ...userObj,
                status: relation.sender.toString() === loggedInUserId ? "sent" : "received",
                requestId: relation._id
            };
        });

        res.status(200).json(usersWithStatus);
    } catch (error) {
        next(error);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const loggedInUserId = req.user.id;
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (!query) {
            return res.status(200).json([]);
        }

        const users = await User.find(
            {
                _id: { $ne: loggedInUserId },
                username: { $regex: query, $options: "i" }
            },
            "username profilePicture bio location portfolioUrl"
        );

        const requests = await FriendRequest.find({
            $or: [
                { sender: loggedInUserId },
                { receiver: loggedInUserId }
            ],
            status: { $in: ["pending", "accepted"] }
        });

        const usersWithStatus = users.map((user) => {
            const userObj = user.toObject();
            const relation = requests.find((request) => {
                const senderId = request.sender.toString();
                const receiverId = request.receiver.toString();
                const userId = user._id.toString();

                return (
                    (senderId === loggedInUserId && receiverId === userId) ||
                    (receiverId === loggedInUserId && senderId === userId)
                );
            });

            if (!relation) {
                return {
                    ...userObj,
                    status: "send"
                };
            }

            if (relation.status === "accepted") {
                return {
                    ...userObj,
                    status: "friend",
                    requestId: relation._id
                };
            }

            return {
                ...userObj,
                status: relation.sender.toString() === loggedInUserId ? "sent" : "received",
                requestId: relation._id
            };
        });

        res.status(200).json(usersWithStatus);
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
    getUserById
};
