const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    sendRequest,
    acceptRequest,
    getReceivedRequests,
    rejectRequest,
    cancelRequest
} = require("../controllers/requestController");

router.post("/send/:receiverId", authMiddleware, sendRequest);
router.get("/received", authMiddleware, getReceivedRequests);
router.patch("/:id/accept", authMiddleware, acceptRequest);
router.delete("/:id/reject", authMiddleware, rejectRequest);
router.delete("/:id/cancel", authMiddleware, cancelRequest);

module.exports = router;
