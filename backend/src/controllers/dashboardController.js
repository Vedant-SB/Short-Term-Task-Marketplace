const Task = require("../models/Task");
const Application = require("../models/Application");
const {
    getTaskReviewStatusMap,
    buildReviewStatus,
    getUserReviewSummary
} = require("../utils/reviewHelpers");

const getCompanyDashboard = async (req, res) => {
    try {

        const companyId = req.user.userId;

        const tasksPosted = await Task.countDocuments({
            postedBy: companyId
        });

        const completedTasks = await Task.countDocuments({
            postedBy: companyId,
            status: "completed"
        });

        const openTasks = await Task.countDocuments({
            postedBy: companyId,
            status: "open"
        });

        const inProgressTasks = await Task.countDocuments({
            postedBy: companyId,
            status: "in_progress"
        });

        const revisionRequestedTasks = await Task.countDocuments({
            postedBy: companyId,
            status: "revision_requested"
        });

        const companyTasks = await Task.find({
            postedBy: companyId
        }).select("_id status");

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

        const applicationsReceived =
            await Application.countDocuments({
                taskId: { $in: taskIds }
            });

        res.status(200).json({
            success: true,
            dashboard: {
                tasksPosted,
                completedTasks,
                openTasks,
                inProgressTasks,
                revisionRequestedTasks,
                applicationsReceived,
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

        const userId = req.user.userId;

        const applicationsSent =
            await Application.countDocuments({
                applicantId: userId
            });

        const acceptedApplications =
            await Application.countDocuments({
                applicantId: userId,
                status: "accepted"
            });

        const completedTasks =
            await Task.countDocuments({
                selectedApplicant: userId,
                status: "completed"
            });

        const reviewSummary =
            await getUserReviewSummary(userId);

        const completedTaskIds =
            await Task.find({
                selectedApplicant: userId,
                status: "completed"
            }).select("_id");

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
                acceptedApplications,
                completedTasks,
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