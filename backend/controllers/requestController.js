const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            return res.status(400).json({ 
                message: "You cannot send a friend request to yourself" 
            });
        }

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status === "accepted") {
                return res.status(400).json({
                    message: "You are already friends"
                });
            }

            if (existingRequest.status === "pending") {
                return res.status(400).json({
                    message: "Friend request already pending"
                });
            }

            existingRequest.sender = senderId;
            existingRequest.receiver = receiverId;
            existingRequest.status = "pending";
            await existingRequest.save();

            return res.status(200).json(existingRequest);
        }

        const newRequest = await FriendRequest.create({
            sender: senderId,
            receiver: receiverId,
            status: "pending"
        });

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const request = await FriendRequest.findOneAndUpdate(
            {
                _id: req.params.id,
                receiver: req.user.id,
                status: "pending"
            },
            { status: "accepted" },
            { new: true }
        ).populate("sender", "username profilePicture");

        if (!request) {
            return res.status(400).json({ 
                message: "Pending request not found" 
            });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const getReceivedRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: "pending"
        })
        .populate("sender", "username profilePicture")
        .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const request = await FriendRequest.findOneAndUpdate(
            {
                _id: req.params.id,
                receiver: req.user.id,
                status: "pending"
            },
            { status: "rejected" },
            { new: true }
        ).populate("sender", "username profilePicture");

        if (!request) {
            return res.status(404).json({ 
                message: "Pending request not found" 
            });
        }

        res.status(200).json({ 
            message: "Request rejected",
            request
        });
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const senderId = req.user.id;

        // Find the pending request sent by the current user
        const request = await FriendRequest.findOne({
            _id: id,
            sender: senderId,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "Pending request not found or cannot be cancelled"
            });
        }

        // Delete the request from the database
        await FriendRequest.deleteOne({ _id: id });

        res.status(200).json({
            message: "Friend request cancelled successfully",
            requestId: id
        });
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    getReceivedRequests,
    rejectRequest,
    cancelRequest
};
