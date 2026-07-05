    const express = require("express");

    const router = express.Router();

    const {
        getPublicProfile
    } = require("../controllers/profileController");

    const authMiddleware = require("../middleware/authMiddleware");
    const validateObjectId = require("../middleware/validateObjectId");

    router.get("/:userId", validateObjectId, authMiddleware, getPublicProfile);

    module.exports = router;
