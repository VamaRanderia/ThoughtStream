const FriendRequest = require("../models/FriendRequest");

const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            return res.status(400).json({ 
                message: "You cannot send a friend request to yourself" 
            });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: "Friend request already sent" 
            });
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
            status: "pending"
        });

        await newRequest.save();

        res.status(201).json(newRequest);
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
        .populate("sender", "username")
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
        const request = await FriendRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({ 
                message: "Request not found" 
            });
        }

        res.status(200).json({ 
            message: "Request rejected" 
        });
    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    sendRequest,
    getReceivedRequests,
    rejectRequest
};