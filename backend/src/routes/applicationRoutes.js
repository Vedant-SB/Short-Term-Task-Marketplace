const express = require("express");

const router = express.Router();

const {
    applyToTask, getApplicantsForTask, acceptApplication, getMyApplications
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, allowRoles("individual"), applyToTask);
router.get("/my-applications", authMiddleware, allowRoles("individual"), getMyApplications);
router.get("/task/:taskId", authMiddleware, allowRoles("company"), getApplicantsForTask);
router.put("/:id/accept", authMiddleware, allowRoles("company"), acceptApplication);

module.exports = router;