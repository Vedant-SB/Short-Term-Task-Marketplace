const Task = require("../models/Task");
const Application = require("../models/Application");
const User = require("../models/User");
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

        // ── Core stats + company info + review summary ──────────
        const [
            companyUser,
            openTasks,
            inProgressTasks,
            completedTasks,
            companyTasks,
            companyReviewSummary
        ] = await Promise.all([
            User.findById(companyId).select("companyName"),
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
                status: "completed"
            }),
            Task.find({
                postedBy: companyId
            }).select("_id status"),
            getUserReviewSummary(companyId)
        ]);

        const taskIds = companyTasks.map(
            task => task._id
        );

        // ── Applications count ──────────────────────────────────
        const applicationsReceived = taskIds.length > 0
            ? await Application.countDocuments({
                taskId: { $in: taskIds }
            })
            : 0;

        // ── Recent Tasks (latest 5) with application counts ─────
        const recentTaskDocs = await Task.find({
            postedBy: companyId
        })
            .select("title description category budget status applicationDeadline currentDeadline createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Get application counts for recent tasks
        const recentTaskIds = recentTaskDocs.map(t => t._id);
        const applicationCounts = recentTaskIds.length > 0
            ? await Application.aggregate([
                {
                    $match: {
                        taskId: { $in: recentTaskIds },
                        status: { $ne: "withdrawn" }
                    }
                },
                {
                    $group: {
                        _id: "$taskId",
                        count: { $sum: 1 }
                    }
                }
            ])
            : [];

        const countMap = new Map(
            applicationCounts.map(c => [c._id.toString(), c.count])
        );

        const recentTasks = recentTaskDocs.map(task => ({
            ...task,
            applicationCount: countMap.get(task._id.toString()) || 0
        }));

        // ── Recent Applications (latest 5 across all tasks) ─────
        const recentApplications = taskIds.length > 0
            ? await Application.find({
                taskId: { $in: taskIds }
            })
                .populate("applicantId", "name profileImage")
                .populate("taskId", "title")
                .sort({ appliedAt: -1 })
                .limit(5)
                .lean()
            : [];

        // ── Upcoming Deadlines (future only, sorted ascending) ──
        const now = new Date();

        const upcomingDeadlines = await Task.find({
            postedBy: companyId,
            status: { $in: ["open", "in_progress"] },
            $or: [
                { applicationDeadline: { $gt: now } },
                { currentDeadline: { $gt: now } }
            ]
        })
            .select("title status applicationDeadline currentDeadline")
            .lean();

        // Sort by the nearest future deadline
        upcomingDeadlines.sort((a, b) => {
            const deadlineA = a.status === "open"
                ? a.applicationDeadline
                : a.currentDeadline;
            const deadlineB = b.status === "open"
                ? b.applicationDeadline
                : b.currentDeadline;

            return new Date(deadlineA) - new Date(deadlineB);
        });

        const limitedDeadlines = upcomingDeadlines.slice(0, 5);

        res.status(200).json({
            success: true,
            dashboard: {
                companyName: companyUser?.companyName || "Company",
                openTasks,
                inProgressTasks,
                completedTasks,
                applicationsReceived,
                averageRating:
                    companyReviewSummary.averageRating,
                reviewCount:
                    companyReviewSummary.reviewCount,
                recentTasks,
                recentApplications,
                upcomingDeadlines: limitedDeadlines
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