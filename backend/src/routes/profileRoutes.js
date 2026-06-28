const express = require("express");

const router = express.Router();

const {
    getPublicProfile
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/:userId", authMiddleware, getPublicProfile);

module.exports = router;
