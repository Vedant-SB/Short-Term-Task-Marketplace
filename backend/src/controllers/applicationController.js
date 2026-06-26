const Application = require("../models/Application");
const Task = require("../models/Task");
const User = require("../models/User");
const {
    getTaskReviewStatusMap,
    buildReviewStatus
} = require("../utils/reviewHelpers");

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

        const studentTypes = [
            "student",
            "first_year_student",
            "second_year_student",
            "third_year_student",
            "final_year_student",
            "fresh_graduate"
        ];

        const isEligible = () => {
            if (
                !task.eligibleFor ||
                task.eligibleFor.length === 0
            ) {
                return true;
            }

            const userType = user.individualType;

            if (task.eligibleFor.includes(userType)) {
                return true;
            }

            // Backward compatibility:
            // Legacy "student" user can apply to any student sub-type task
            if (
                userType === "student" &&
                task.eligibleFor.some(e =>
                    studentTypes.includes(e)
                )
            ) {
                return true;
            }

            // Legacy task with "student" accepts all student sub-types
            if (
                task.eligibleFor.includes("student") &&
                studentTypes.includes(userType)
            ) {
                return true;
            }

            return false;
        };

        if (!isEligible()) {
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



const getMyApplications = async (req, res) => {
    try {

        const applications = await Application.find({
            applicantId: req.user.userId
        })
            .populate({
                path: "taskId",
                select: "title budget status category duration createdAt revisionReason revisionExpectedChanges",
                populate: {
                    path: "postedBy",
                    select: "companyName"
                }
            })
            .sort({
                createdAt: -1
            });

        const reviewMap =
            await getTaskReviewStatusMap(
                applications
                    .map(application =>
                        application.taskId?._id
                    )
                    .filter(Boolean)
            );

        const applicationsWithReviews = applications.map(
            (application) => {
                const applicationData =
                    application.toObject();

                if (applicationData.taskId) {
                    applicationData.taskId.reviewStatus =
                        buildReviewStatus(
                            reviewMap.get(
                                applicationData.taskId._id.toString()
                            ) || []
                        );
                }

                return applicationData;
            }
        );

        res.status(200).json({
            success: true,
            count: applicationsWithReviews.length,
            applications: applicationsWithReviews
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
    acceptApplication,
    getMyApplications
};
