const User = require("../models/User");
const Task = require("../models/Task");
const Application = require("../models/Application");
const Review = require("../models/Review");
const {
    getUserReviewSummary
} = require("../utils/reviewHelpers");

const getPublicProfile = async (req, res) => {
    try {

        const { userId } = req.params;

        // =========================
        // ACCESS CONTROL
        // =========================

        if (req.user.role === "individual") {

            if (req.user.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view your own profile"
                });
            }

        } else if (req.user.role === "company") {

            const companyTaskIds = await Task.distinct("_id", {
                postedBy: req.user.userId
            });

            const hasApplied = companyTaskIds.length > 0
                ? await Application.exists({
                    applicantId: userId,
                    taskId: { $in: companyTaskIds }
                })
                : null;

            if (!hasApplied) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view profiles of applicants who applied to your tasks"
                });
            }

        }

        // =========================
        // FETCH USER
        // =========================

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =========================
        // REVIEW SUMMARY
        // =========================

        const reviewSummaryPromise =
            getUserReviewSummary(userId);

        // =========================
        // STATISTICS
        // =========================

        const [
            reviewSummary,
            completedTasks,
            applicationsAccepted,
            activeTasks,
            completedTasksData
        ] = await Promise.all([
            reviewSummaryPromise,
            Task.countDocuments({
                selectedApplicant: userId,
                status: "completed"
            }),
            Application.countDocuments({
                applicantId: userId,
                status: "accepted"
            }),
            Task.find({
                selectedApplicant: userId,
                status: {
                    $in: [
                        "in_progress",
                        "under_review",
                        "revision_requested"
                    ]
                }
            }).select("status"),
            Task.find({
                selectedApplicant: userId,
                status: "completed"
            })
                .populate("postedBy", "companyName")
                .sort({ updatedAt: -1 })
        ]);

        const applicationsCompleted =
            completedTasks;

        const statistics = {
            averageRating: reviewSummary.averageRating,
            totalReviews: reviewSummary.reviewCount,
            completedTasks,
            portfolioProjects: completedTasks,
            applicationsAccepted,
            applicationsCompleted
        };

        // =========================
        // PROFILE STATUS
        // =========================

        let profileStatus = "Available";

        if (activeTasks.some(
            t => t.status === "revision_requested"
        )) {
            profileStatus = "Revision Requested";
        } else if (activeTasks.length > 0) {
            profileStatus = "Working";
        }

        const activeTaskCount = activeTasks.length;

        // =========================
        // PORTFOLIO
        // =========================

        const completedTaskIds = completedTasksData.map(task => task._id);

        const companyReviews = completedTaskIds.length > 0
            ? await Review.find({
                task: { $in: completedTaskIds },
                reviewee: userId,
                reviewType: "company_to_individual"
            }).select("task rating comment")
            : [];

        const reviewByTaskId = new Map(
            companyReviews.map(review => [
                review.task.toString(),
                review
            ])
        );

        const portfolio = completedTasksData.map((task) => {
            const review = reviewByTaskId.get(task._id.toString());

            return {
                taskId: task._id,
                title: task.title,
                category: task.category,
                skillsUsed: task.skillsRequired,
                completedOn: task.updatedAt,
                companyRating: review?.rating || null,
                companyReview: review?.comment || null
            };
        });

        // =========================
        // RESPONSE
        // =========================

        res.status(200).json({
            success: true,
            profile: {
                ...user.toObject(),
                statistics,
                profileStatus,
                activeTaskCount,
                reviewSummary,
                portfolio
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
    getPublicProfile
};
