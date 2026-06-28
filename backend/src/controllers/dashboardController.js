const Task = require("../models/Task");
const Application = require("../models/Application");
const {
    getTaskReviewStatusMap,
    buildReviewStatus,
    getUserReviewSummary
} = require("../utils/reviewHelpers");
const {
    closeExpiredApplicationTasks
} = require("../utils/taskWorkflowHelpers");

const getCompanyDashboard = async (req, res) => {
    try {

        await closeExpiredApplicationTasks();

        const companyId = req.user.userId;

        const [
            tasksPosted,
            completedTasks,
            openTasks,
            inProgressTasks,
            revisionRequestedTasks,
            underReviewTasks,
            individualsHired,
            companyTasks,
            companyReviewSummary
        ] = await Promise.all([
            Task.countDocuments({
                postedBy: companyId
            }),
            Task.countDocuments({
                postedBy: companyId,
                status: "completed"
            }),
            Task.countDocuments({
                postedBy: companyId,
                status: "open"
            }),
            Task.countDocuments({
                postedBy: companyId,
                status: "in_progress"
            }),
            Task.countDocuments({
                postedBy: companyId,
                status: "revision_requested"
            }),
            Task.countDocuments({
                postedBy: companyId,
                status: "under_review"
            }),
            Task.countDocuments({
                postedBy: companyId,
                selectedApplicant: { $ne: null }
            }),
            Task.find({
                postedBy: companyId
            }).select("_id status"),
            getUserReviewSummary(companyId)
        ]);

        const taskIds = companyTasks.map(
            task => task._id
        );

        const reviewMap =
            await getTaskReviewStatusMap(taskIds);

        const completedReviews =
            companyTasks.filter((task) => {
                const status =
                    buildReviewStatus(
                        reviewMap.get(
                            task._id.toString()
                        ) || []
                    );

                return status.companyReviewSubmitted;
            }).length;

        const pendingReviews =
            companyTasks.filter((task) => {
                const status =
                    buildReviewStatus(
                        reviewMap.get(
                            task._id.toString()
                        ) || []
                    );

                return task.status === "completed" &&
                    !status.companyReviewSubmitted;
            }).length;

        const applicationsReceived = taskIds.length > 0
            ? await Application.countDocuments({
                taskId: { $in: taskIds }
            })
            : 0;

        res.status(200).json({
            success: true,
            dashboard: {
                tasksPosted,
                completedTasks,
                openTasks,
                inProgressTasks,
                underReviewTasks,
                revisionRequestedTasks,
                applicationsReceived,
                individualsHired,
                averageRating:
                    companyReviewSummary.averageRating,
                pendingReviews,
                completedReviews
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



const getIndividualDashboard = async (req, res) => {
    try {

        await closeExpiredApplicationTasks();

        const userId = req.user.userId;

        const [
            applicationsSent,
            acceptedApplications,
            completedTasks,
            reviewSummary,
            completedTaskIds,
            pendingApplications
        ] = await Promise.all([
            Application.countDocuments({
                applicantId: userId
            }),
            Application.countDocuments({
                applicantId: userId,
                status: "accepted"
            }),
            Task.countDocuments({
                selectedApplicant: userId,
                status: "completed"
            }),
            getUserReviewSummary(userId),
            Task.find({
                selectedApplicant: userId,
                status: "completed"
            }).select("_id"),
            Application.countDocuments({
                applicantId: userId,
                status: "pending"
            })
        ]);

        const reviewMap =
            await getTaskReviewStatusMap(
                completedTaskIds.map(task => task._id)
            );

        const pendingReviews =
            completedTaskIds.filter((task) => {
                const status =
                    buildReviewStatus(
                        reviewMap.get(
                            task._id.toString()
                        ) || []
                    );

                return status.companyReviewSubmitted &&
                    !status.individualReviewSubmitted;
            }).length;

        const completedReviews =
            completedTaskIds.filter((task) => {
                const status =
                    buildReviewStatus(
                        reviewMap.get(
                            task._id.toString()
                        ) || []
                    );

                return status.individualReviewSubmitted;
            }).length;

        res.status(200).json({
            success: true,
            dashboard: {
                applicationsSent,
                pendingApplications,
                acceptedApplications,
                completedTasks,
                portfolioProjects: completedTasks,
                averageRating:
                    reviewSummary.averageRating,
                reviewCount:
                    reviewSummary.reviewCount,
                pendingReviews,
                completedReviews
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getCompanyDashboard,
    getIndividualDashboard
};