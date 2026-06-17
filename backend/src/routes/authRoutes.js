const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);

router.get(
    "/test-company",
    authMiddleware,
    allowRoles("company"),
    (req, res) => {
        res.json({
            message: "Company route accessed"
        });
    }
);

module.exports = router;