const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    sendRequest,
    getReceivedRequests,
    rejectRequest
} = require("../controllers/requestController");

router.post("/send/:receiverId", authMiddleware, sendRequest);
router.get("/received", authMiddleware, getReceivedRequests);
router.delete("/:id/reject", authMiddleware, rejectRequest);

module.exports = router;