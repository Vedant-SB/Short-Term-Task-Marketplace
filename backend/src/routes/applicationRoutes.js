const express = require("express");

const router = express.Router();

const {
    applyToTask, getApplicantsForTask, acceptApplication, getMyApplications, withdrawApplication
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/", authMiddleware, allowRoles("individual"), applyToTask);
router.get("/my-applications", authMiddleware, allowRoles("individual"), getMyApplications);
router.get("/task/:taskId", authMiddleware, allowRoles("company"), getApplicantsForTask);
router.put("/:id/accept", validateObjectId, authMiddleware, allowRoles("company"), acceptApplication);
router.put("/:id/withdraw", validateObjectId, authMiddleware, allowRoles("individual"), withdrawApplication);

module.exports = router;