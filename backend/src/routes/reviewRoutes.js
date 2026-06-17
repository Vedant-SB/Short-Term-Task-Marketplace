const express = require("express");

const router = express.Router();

const { createReview } = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/:taskId", authMiddleware, createReview);

module.exports = router;