const express = require("express");

const router = express.Router();

const {
    getPublicProfile,
    updateProfile
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

router.put("/", authMiddleware, updateProfile);
router.get("/:userId", validateObjectId, authMiddleware, getPublicProfile);

module.exports = router;
