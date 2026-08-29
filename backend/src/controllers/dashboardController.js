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

        // ── Active Applications count ───────────────────────────
        // Count only currently active applications (pending + accepted)
        const activeApplications = await Application.countDocuments({
            taskId: { $in: taskIds },
            status: { $in: ["pending", "accepted"] }
        });

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
                activeApplications,
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
            user,
            applicationsSent,
            activeApplications,
            assignedTasksCount,
            completedProjects,
            reviewSummary,
            continueWorkingDocs,
            recentApplicationsDocs,
            appliedTaskIds
        ] = await Promise.all([
            User.findById(userId).select("name email skills"),

            Application.countDocuments({
                applicantId: userId
            }),

            Application.countDocuments({
                applicantId: userId,
                status: { $in: ["pending", "accepted", "selected"] }
            }),

            Task.countDocuments({
                selectedApplicant: userId,
                status: { $in: ["in_progress", "under_review", "revision_requested"] }
            }),

            Task.countDocuments({
                selectedApplicant: userId,
                status: "completed"
            }),

            getUserReviewSummary(userId),

            Task.find({
                selectedApplicant: userId,
                status: { $in: ["in_progress", "under_review", "revision_requested"] }
            })
                .populate("postedBy", "companyName")
                .sort({ currentDeadline: 1 })
                .limit(3)
                .lean(),

            Application.find({
                applicantId: userId
            })
                .populate({
                    path: "taskId",
                    select: "title category budget duration status currentDeadline applicationDeadline postedBy",
                    populate: { path: "postedBy", select: "companyName" }
                })
                .sort({ appliedAt: -1 })
                .limit(5)
                .lean(),

            Application.distinct("taskId", {
                applicantId: userId,
                status: { $ne: "withdrawn" }
            })
        ]);

        // Recommended tasks (open, not applied to, sorted by skill match)
        const openTasksDocs = await Task.find({
            status: "open",
            applicationDeadline: { $gt: new Date() },
            _id: { $nin: appliedTaskIds }
        })
            .populate("postedBy", "companyName")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const userSkills = (user?.skills || []).map(s => String(s).toLowerCase());

        openTasksDocs.sort((a, b) => {
            const matchA = (a.skillsRequired || []).filter(s => userSkills.includes(String(s).toLowerCase())).length;
            const matchB = (b.skillsRequired || []).filter(s => userSkills.includes(String(s).toLowerCase())).length;
            return matchB - matchA;
        });

        const recommendedTasks = openTasksDocs.slice(0, 3);

        const studentName = user?.name || user?.email?.split("@")[0] || "Student";

        const taskIdsForReview = recentApplicationsDocs
            .map(app => app.taskId?._id)
            .filter(Boolean);

        const reviewMap = await getTaskReviewStatusMap(taskIdsForReview);

        const recentApplicationsWithReviews = recentApplicationsDocs.map(app => {
            if (!app.taskId) return app;
            const reviews = reviewMap.get(app.taskId._id.toString()) || [];
            const reviewStatus = buildReviewStatus(reviews);
            return {
                ...app,
                taskId: {
                    ...app.taskId,
                    reviewStatus
                }
            };
        });

        res.status(200).json({
            success: true,
            dashboard: {
                studentName,
                statistics: {
                    applicationsSent,
                    activeApplications,
                    assignedTasks: assignedTasksCount,
                    completedProjects,
                    averageRating: reviewSummary.averageRating,
                    reviewCount: reviewSummary.reviewCount
                },
                continueWorking: continueWorkingDocs,
                recentApplications: recentApplicationsWithReviews,
                recommendedTasks
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