const express = require("express");

const router = express.Router();

const {
    getCompanyDashboard,
    getIndividualDashboard
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/company", authMiddleware, allowRoles("company"), getCompanyDashboard);
router.get("/individual", authMiddleware, allowRoles("individual"), getIndividualDashboard);

module.exports = router;