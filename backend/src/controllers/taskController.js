const Task = require("../models/Task");
const Application = require("../models/Application");

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
            eligibleFor
        } = req.body;

        const task = await Task.create({
            title,
            description,
            category,
            skillsRequired,
            budget,
            duration,
            deliverables,
            eligibleFor,

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

        const {
            category,
            skill,
            budgetMin,
            budgetMax,
            duration
        } = req.query;

        const filter = {
            status: "open"
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
            .populate("postedBy", "companyName");

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

        const task = await Task.findById(req.params.id)
            .populate("postedBy", "companyName");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        let hasApplied = false;

        if (
            req.user &&
            req.user.role === "individual"
        ) {

            const existingApplication =
                await Application.findOne({
                    taskId: task._id,
                    applicantId:
                        req.user.userId
                });

            hasApplied =
                !!existingApplication;
        }

        res.status(200).json({
            success: true,
            task,
            hasApplied
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

        const tasks = await Task.find({
            postedBy: req.user.userId
        })
            .populate(
                "selectedApplicant",
                "name individualType"
            );

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

        const allowedUpdates = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            skillsRequired: req.body.skillsRequired,
            budget: req.body.budget,
            duration: req.body.duration,
            deliverables: req.body.deliverables,
            eligibleFor: req.body.eligibleFor
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

        if (task.status !== "in_progress") {
            return res.status(400).json({
                success: false,
                message: "Task is not in progress"
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

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    getMyTasks,
    updateTask,
    deleteTask,
    submitWork,
    markTaskComplete
};