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
const validateObjectId = require("../middleware/validateObjectId");

router.post("/", authMiddleware, allowRoles("company"), createTask);

router.get("/", getAllTasks);

router.put(
    "/:id/complete",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    markTaskComplete
);

router.put(
    "/:id/request-changes",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    requestChanges
);

router.put(
    "/:id/extend-application-deadline",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    extendApplicationDeadline
);

router.put(
    "/:id/extend-submission-deadline",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    extendSubmissionDeadline
);

router.get(
    "/my-tasks",
    authMiddleware,
    allowRoles("company"),
    getMyTasks
);

router.put(
    "/:id/submit",
    validateObjectId,
    authMiddleware,
    allowRoles("individual"),
    submitWork
);

router.get(
    "/:id",
    validateObjectId,
    optionalAuth,
    getTaskById
);

router.put(
    "/:id",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    updateTask
);

router.delete(
    "/:id",
    validateObjectId,
    authMiddleware,
    allowRoles("company"),
    deleteTask
);

module.exports = router;