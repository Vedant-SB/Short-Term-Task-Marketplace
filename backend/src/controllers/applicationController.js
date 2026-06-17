const Application = require("../models/Application");
const Task = require("../models/Task");
const User = require("../models/User");

const applyToTask = async (req, res) => {
    try {

        const { taskId } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const user = await User.findById(
            req.user.userId
        );

        if (
            task.eligibleFor &&
            task.eligibleFor.length > 0 &&
            !task.eligibleFor.includes(
                user.individualType
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not eligible for this task"
            });
        }

        if (task.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Task is no longer accepting applications"
            });
        }

        const existingApplication =
            await Application.findOne({
                taskId,
                applicantId: req.user.userId
            });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "Already applied to this task"
            });
        }

        const application = await Application.create({
            taskId,
            applicantId: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Applied successfully",
            application
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



const getApplicantsForTask = async (req, res) => {
    try {

        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view applicants for your own tasks"
            });
        }

        const applications = await Application.find({
            taskId
        })
        .populate(
            "applicantId",
            "name individualType skills"
        );

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



const acceptApplication = async (req, res) => {
    try {

        const application = await Application.findById(
            req.params.id
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        const task = await Task.findById(
            application.taskId
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (
            task.postedBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only manage your own tasks"
            });
        }

        application.status = "accepted";
        await application.save();

        task.selectedApplicant =
            application.applicantId;

        task.status = "in_progress";

        await task.save();

        await Application.updateMany(
            {
                taskId: task._id,
                _id: { $ne: application._id }
            },
            {
                status: "rejected"
            }
        );

        res.status(200).json({
            success: true,
            message:
                "Applicant selected successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    applyToTask,
    getApplicantsForTask,
    acceptApplication
};