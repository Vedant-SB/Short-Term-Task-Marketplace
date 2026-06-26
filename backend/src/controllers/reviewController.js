const Review = require("../models/Review");
const Task = require("../models/Task");
const {
    REVIEW_TYPE_BY_ROLE
} = require("../utils/reviewHelpers");

const createReview = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { rating, comment } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Task must be completed before reviewing"
            });
        }

        if (!task.selectedApplicant) {
            return res.status(400).json({
                success: false,
                message: "Task must have a selected applicant before reviewing"
            });
        }

        let reviewee;
        let reviewType;

        if (req.user.role === "company") {
            if (task.postedBy.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized"
                });
            }

            reviewee = task.selectedApplicant;
            reviewType = REVIEW_TYPE_BY_ROLE.company;
        } else if (req.user.role === "individual") {
            if (task.selectedApplicant.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized"
                });
            }

            reviewee = task.postedBy;
            reviewType = REVIEW_TYPE_BY_ROLE.individual;
        }

        const normalizedRating = Number(rating);

        if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const existingReview = await Review.findOne({
            task: taskId,
            reviewType
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted"
            });
        }

        if (req.user.role === "individual") {
            const companyReview = await Review.findOne({
                task: taskId,
                reviewType: REVIEW_TYPE_BY_ROLE.company
            });

            if (!companyReview) {
                return res.status(400).json({
                    success: false,
                    message: "Company review must be submitted first"
                });
            }
        }

        const review = await Review.create({
            task: task._id,
            reviewer: req.user.userId,
            reviewee,
            reviewType,
            rating: normalizedRating,
            comment: comment.trim()
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createReview
};
