const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { validateIdParam, validateReceiverIdParam } = require("../middleware/validationMiddleware");

const {
    sendRequest,
    acceptRequest,
    getReceivedRequests,
    rejectRequest,
    cancelRequest
} = require("../controllers/requestController");

router.post("/send/:receiverId", authMiddleware, validateReceiverIdParam, sendRequest);
router.get("/received", authMiddleware, getReceivedRequests);
router.patch("/:id/accept", authMiddleware, validateIdParam, acceptRequest);
router.delete("/:id/reject", authMiddleware, validateIdParam, rejectRequest);
router.delete("/:id/cancel", authMiddleware, validateIdParam, cancelRequest);

module.exports = router;
