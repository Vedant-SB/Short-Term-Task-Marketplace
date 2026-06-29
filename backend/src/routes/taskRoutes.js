const express = require("express");

const router = express.Router();

const {
    createTask,
    getAllTasks,
    getTaskById,
    getMyTasks,
    updateTask,
    deleteTask,
    submitWork,
    markTaskComplete,
    requestChanges,
    extendApplicationDeadline,
    extendSubmissionDeadline
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const allowRoles = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, allowRoles("company"), createTask);
router.get("/", getAllTasks);
router.put("/:id/complete", authMiddleware, allowRoles("company"), markTaskComplete);
router.put("/:id/request-changes", authMiddleware, allowRoles("company"), requestChanges);
router.put("/:id/extend-application-deadline", authMiddleware, allowRoles("company"), extendApplicationDeadline);
router.put("/:id/extend-submission-deadline", authMiddleware, allowRoles("company"), extendSubmissionDeadline);
router.get("/my-tasks", authMiddleware, allowRoles("company"), getMyTasks);
router.put("/:id/submit", authMiddleware, allowRoles("individual"), submitWork);
router.get("/:id", optionalAuth, getTaskById);
router.put("/:id", authMiddleware, allowRoles("company"), updateTask);
router.delete("/:id", authMiddleware, allowRoles("company"), deleteTask);


module.exports = router;