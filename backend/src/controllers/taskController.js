const Task = require("../models/Task");
const Application = require("../models/Application");
const {
    getTaskReviewStatusMap,
    buildReviewStatus
} = require("../utils/reviewHelpers");
const {
    parseApplicationDeadline,
    closeExpiredApplicationTasks,
    computeTaskDeadline,
    addDays
} = require("../utils/taskWorkflowHelpers");

const createTask = async (req, res) => {
    try {

        const {
            title,
            description,
            category,
            skillsRequired,
            budget,
            duration,
            deliverables,
            eligibleFor,
            applicationDeadline
        } = req.body;

        const parsedApplicationDeadline =
            parseApplicationDeadline(applicationDeadline);

        if (!parsedApplicationDeadline) {
            return res.status(400).json({
                success: false,
                message: "Valid application deadline is required"
            });
        }

        if (parsedApplicationDeadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Application deadline must be in the future"
            });
        }

        const task = await Task.create({
            title,
            description,
            category,
            skillsRequired,
            budget,
            duration,
            deliverables,
            eligibleFor,
            applicationDeadline: parsedApplicationDeadline,
            postedBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getAllTasks = async (req, res) => {
    try {

        await closeExpiredApplicationTasks();

        const {
            category,
            skill,
            budgetMin,
            budgetMax,
            duration
        } = req.query;

        const filter = {
            status: "open",
            applicationDeadline: { $gte: new Date() }
        };

        if (category) {
            filter.category = category;
        }

        if (skill) {
            filter.skillsRequired = {
                $in: [skill]
            };
        }

        if (budgetMin || budgetMax) {

            filter.budget = {};

            if (budgetMin) {
                filter.budget.$gte = Number(budgetMin);
            }

            if (budgetMax) {
                filter.budget.$lte = Number(budgetMax);
            }
        }

        if (duration) {
            filter.duration = {
                $lte: Number(duration)
            };
        }

        const tasks = await Task.find(filter)
            .populate("postedBy", "companyName")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getTaskById = async (req, res) => {
    try {

        await Task.updateOne(
            {
                _id: req.params.id,
                status: "open",
                applicationDeadline: { $lt: new Date() }
            },
            {
                $set: { status: "closed" }
            }
        );

        const task = await Task.findById(req.params.id)
            .populate("postedBy", "companyName")
            .populate(
                "selectedApplicant",
                "name email individualType"
            );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const isIndividual =
            req.user && req.user.role === "individual";

        const isTaskOwner =
            req.user &&
            req.user.role === "company" &&
            task.postedBy._id.toString() === req.user.userId;

        const [
            existingApplication,
            applicationCount,
            reviewMap
        ] = await Promise.all([
            isIndividual
                ? Application.findOne({
                    taskId: task._id,
                    applicantId: req.user.userId
                })
                : Promise.resolve(null),
            isTaskOwner
                ? Application.countDocuments({
                    taskId: task._id,
                    status: { $ne: "withdrawn" }
                })
                : Promise.resolve(0),
            getTaskReviewStatusMap([task._id])
        ]);

        let hasApplied = false;
        let applicationId = null;
        let applicationStatus = null;

        if (existingApplication) {
            hasApplied =
                existingApplication.status !== "withdrawn";
            applicationId = existingApplication._id;
            applicationStatus = existingApplication.status;
        }

        const reviewStatus =
            buildReviewStatus(
                reviewMap.get(task._id.toString()) || []
            );

        const taskData = task.toObject();
        taskData.reviewStatus = reviewStatus;

        res.status(200).json({
            success: true,
            task: taskData,
            hasApplied,
            applicationId,
            applicationStatus,
            applicationCount
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getMyTasks = async (req, res) => {
    try {

        await Task.updateMany(
            {
                postedBy: req.user.userId,
                status: "open",
                applicationDeadline: { $lt: new Date() }
            },
            {
                $set: { status: "closed" }
            }
        );

        const tasks = await Task.find({
            postedBy: req.user.userId
        })
            .populate(
                "selectedApplicant",
                "name individualType"
            )
            .sort({
                createdAt: -1
            });

        const reviewMap =
            await getTaskReviewStatusMap(
                tasks.map(task => task._id)
            );

        const tasksWithReviews = tasks.map((task) => {
            const taskData = task.toObject();
            taskData.reviewStatus =
                buildReviewStatus(
                    reviewMap.get(
                        task._id.toString()
                    ) || []
                );

            return taskData;
        });

        res.status(200).json({
            success: true,
            count: tasksWithReviews.length,
            tasks: tasksWithReviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const updateTask = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own tasks"
            });
        }

        if (task.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Can only edit open tasks"
            });
        }

        const applicationCount =
            await Application.countDocuments({
                taskId: task._id,
                status: { $ne: "withdrawn" }
            });

        if (applicationCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot edit task with existing applications"
            });
        }

        let parsedApplicationDeadline;

        if (req.body.applicationDeadline !== undefined) {
            parsedApplicationDeadline =
                parseApplicationDeadline(req.body.applicationDeadline);

            if (!parsedApplicationDeadline) {
                return res.status(400).json({
                    success: false,
                    message: "Valid application deadline is required"
                });
            }

            if (parsedApplicationDeadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Application deadline must be in the future"
                });
            }
        }

        const allowedUpdates = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            skillsRequired: req.body.skillsRequired,
            budget: req.body.budget,
            duration: req.body.duration,
            deliverables: req.body.deliverables,
            eligibleFor: req.body.eligibleFor,
            applicationDeadline: parsedApplicationDeadline
        };

        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const deleteTask = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own tasks"
            });
        }

        if (task.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Can only delete open tasks"
            });
        }

        const applicationCount =
            await Application.countDocuments({
                taskId: task._id,
                status: { $ne: "withdrawn" }
            });

        if (applicationCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete task with existing applications"
            });
        }

        await Application.deleteMany({
            taskId: task._id
        });

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const submitWork = async (req, res) => {
    try {

        const { submissionLink, submissionNote } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (
            task.status !== "in_progress" &&
            task.status !== "revision_requested"
        ) {
            return res.status(400).json({
                success: false,
                message: "Task is not in progress or awaiting revision"
            });
        }

        if (
            !task.selectedApplicant ||
            task.selectedApplicant.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message: "Only selected applicant can submit work"
            });
        }

        if (!submissionLink || !submissionNote) {
            return res.status(400).json({
                success: false,
                message: "Submission link and note required"
            });
        }

        task.submissionLink = submissionLink;
        task.submissionNote = submissionNote;
        task.submittedAt = new Date();

        task.revisionReason = "";
        task.revisionExpectedChanges = "";
        task.revisionRequestedAt = undefined;

        task.status = "under_review";

        await task.save();

        res.status(200).json({
            success: true,
            message: "Work submitted successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const markTaskComplete = async (req, res) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        if (task.status !== "under_review") {
            return res.status(400).json({
                success: false,
                message: "Task is not under review"
            });
        }

        task.status = "completed";

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task marked as completed",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const requestChanges = async (req, res) => {
    try {

        const { reason, expectedChanges } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        if (task.status !== "under_review") {
            return res.status(400).json({
                success: false,
                message: "Task is not under review"
            });
        }

        if (!reason || !expectedChanges) {
            return res.status(400).json({
                success: false,
                message: "Reason and expected changes are required"
            });
        }

        task.status = "revision_requested";
        task.revisionReason = reason;
        task.revisionExpectedChanges = expectedChanges;
        task.revisionRequestedAt = new Date();

        await task.save();

        res.status(200).json({
            success: true,
            message: "Revision requested successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const extendTaskDeadline = async (req, res) => {
    try {

        const { days } = req.body;
        const normalizedDays = Number(days);

        if (!Number.isInteger(normalizedDays) || normalizedDays < 1) {
            return res.status(400).json({
                success: false,
                message: "Extension days must be a positive integer"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        const extendableStatuses = [
            "in_progress",
            "revision_requested",
            "under_review"
        ];

        if (!extendableStatuses.includes(task.status)) {
            return res.status(400).json({
                success: false,
                message: "Deadline can only be extended while task is active"
            });
        }

        if (!task.taskDeadline) {
            return res.status(400).json({
                success: false,
                message: "Task deadline is not set"
            });
        }

        const previousDeadline = new Date(task.taskDeadline);
        const newDeadline = addDays(previousDeadline, normalizedDays);

        task.taskDeadline = newDeadline;
        task.deadlineExtensions.push({
            days: normalizedDays,
            previousDeadline,
            newDeadline,
            extendedBy: req.user.userId
        });

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task deadline extended successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    getMyTasks,
    updateTask,
    deleteTask,
    submitWork,
    markTaskComplete,
    requestChanges,
    extendTaskDeadline
};
