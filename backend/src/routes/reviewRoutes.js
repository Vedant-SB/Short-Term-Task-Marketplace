const express = require("express");

const router = express.Router();

const { createReview } = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/:taskId", validateObjectId, authMiddleware, createReview);

module.exports = router;