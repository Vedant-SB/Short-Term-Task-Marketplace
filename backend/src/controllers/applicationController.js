const Application = require("../models/Application");
const Task = require("../models/Task");
const User = require("../models/User");
const Review = require("../models/Review");
const {
    getTaskReviewStatusMap,
    buildReviewStatus
} = require("../utils/reviewHelpers");
const {
    computeTaskDeadline,
    closeExpiredApplicationTasks
} = require("../utils/taskWorkflowHelpers");

const applyToTask = async (req, res) => {
    try {

        await closeExpiredApplicationTasks();

        const { taskId } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.status !== "open" || task.applicationDeadline < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Task is no longer accepting applications"
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

            if (
                userType === "student" &&
                task.eligibleFor.some(e =>
                    studentTypes.includes(e)
                )
            ) {
                return true;
            }

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

        const existingApplication =
            await Application.findOne({
                taskId,
                applicantId: req.user.userId
            });

        if (existingApplication && existingApplication.status !== "withdrawn") {
            return res.status(400).json({
                success: false,
                message: "Already applied to this task"
            });
        }

        if (existingApplication && existingApplication.status === "withdrawn") {
            existingApplication.status = "pending";
            await existingApplication.save();

            return res.status(200).json({
                success: true,
                message: "Applied successfully",
                application: existingApplication
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

        if (error && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Already applied to this task"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getApplicantsForTask = async (req, res) => {
    try {

        await closeExpiredApplicationTasks();

        const { taskId } = req.params;

        const task = await Task.findById(taskId).select("postedBy");

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
            )
            .sort({
                createdAt: -1
            });

        const applicantIds = applications
            .map(application => application.applicantId?._id)
            .filter(Boolean);

        const [
            reviewAggregates,
            completedTaskAggregates
        ] = await Promise.all([
            applicantIds.length > 0
                ? Review.aggregate([
                    {
                        $match: {
                            reviewee: { $in: applicantIds }
                        }
                    },
                    {
                        $group: {
                            _id: "$reviewee",
                            averageRating: { $avg: "$rating" },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ])
                : [],
            applicantIds.length > 0
                ? Task.aggregate([
                    {
                        $match: {
                            selectedApplicant: { $in: applicantIds },
                            status: "completed"
                        }
                    },
                    {
                        $group: {
                            _id: "$selectedApplicant",
                            completedProjects: { $sum: 1 }
                        }
                    }
                ])
                : []
        ]);

        const reviewSummaryByApplicant = new Map(
            reviewAggregates.map((entry) => [
                entry._id.toString(),
                {
                    averageRating: Number((entry.averageRating || 0).toFixed(1)),
                    totalReviews: entry.totalReviews || 0
                }
            ])
        );

        const completedProjectsByApplicant = new Map(
            completedTaskAggregates.map((entry) => [
                entry._id.toString(),
                entry.completedProjects || 0
            ])
        );

        const enrichedApplications = applications.map((application) => {
            const applicationData = application.toObject();
            const applicantId = applicationData.applicantId?._id?.toString();

            if (applicantId) {
                const reviewSummary = reviewSummaryByApplicant.get(applicantId) || {
                    averageRating: 0,
                    totalReviews: 0
                };

                applicationData.applicantId.averageRating =
                    reviewSummary.averageRating;
                applicationData.applicantId.totalReviews =
                    reviewSummary.totalReviews;
                applicationData.applicantId.completedProjects =
                    completedProjectsByApplicant.get(applicantId) || 0;
            }

            return applicationData;
        });

        res.status(200).json({
            success: true,
            count: enrichedApplications.length,
            applications: enrichedApplications
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
        ).select("taskId applicantId status");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (application.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending applications can be accepted"
            });
        }

        const task = await Task.findById(application.taskId)
        select:
        "title budget status category duration createdAt applicationDeadline taskStartDate originalDeadline currentDeadline deadlineExtensions revisionReason revisionExpectedChanges"

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only manage your own tasks"
            });
        }

        if (task.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Task is no longer open."
            });
        }

        if (task.applicationDeadline < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Application deadline has passed"
            });
        }

        const taskStartDate = new Date();

        const submissionDeadline = computeTaskDeadline(
            taskStartDate,
            task.duration
        );

        const updatedTask = await Task.findOneAndUpdate(
            {
                _id: task._id,
                postedBy: req.user.userId,
                status: "open",
                selectedApplicant: null,
                applicationDeadline: { $gte: taskStartDate }
            },
            {
                $set: {
                    selectedApplicant: application.applicantId,
                    status: "in_progress",
                    taskStartDate,
                    originalDeadline: submissionDeadline,
                    currentDeadline: submissionDeadline
                }
            },
            {
                new: true
            }
        );

        if (!updatedTask) {
            return res.status(409).json({
                success: false,
                message: "Task already has an accepted applicant or is closed"
            });
        }

        const acceptedApplication = await Application.findOneAndUpdate(
            {
                _id: application._id,
                status: "pending"
            },
            {
                $set: { status: "accepted" }
            },
            {
                new: true
            }
        );

        if (!acceptedApplication) {
            return res.status(409).json({
                success: false,
                message: "Application status changed. Please refresh and try again."
            });
        }

        await Application.updateMany(
            {
                taskId: task._id,
                _id: { $ne: application._id },
                status: "pending"
            },
            {
                $set: { status: "rejected" }
            }
        );

        res.status(200).json({
            success: true,
            message: "Applicant selected successfully"
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

        await closeExpiredApplicationTasks();

        const applications = await Application.find({
            applicantId: req.user.userId
        })
            .populate({
                path: "taskId",
                select: "title budget status category duration createdAt applicationDeadline taskStartDate originalDeadline currentDeadline deadlineExtensions revisionReason revisionExpectedChanges", populate: {
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

const withdrawApplication = async (req, res) => {
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

        if (
            application.applicantId.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only withdraw your own applications"
            });
        }

        if (application.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Can only withdraw pending applications"
            });
        }

        application.status = "withdrawn";
        await application.save();

        res.status(200).json({
            success: true,
            message: "Application withdrawn successfully"
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
    getMyApplications,
    withdrawApplication
};
