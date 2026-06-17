const express = require("express");

const router = express.Router();

const { createTask,getAllTasks,getTaskById,getMyTasks,updateTask,deleteTask } = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, allowRoles("company"), createTask);
router.get("/", getAllTasks);
router.get("/my-tasks", authMiddleware, allowRoles("company"), getMyTasks);
router.get("/:id", getTaskById);
router.put("/:id", authMiddleware, allowRoles("company"), updateTask);
router.delete("/:id", authMiddleware, allowRoles("company"), deleteTask);

module.exports = router;