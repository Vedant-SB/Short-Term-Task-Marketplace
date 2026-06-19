const Review = require("../models/Review");
const Task = require("../models/Task");

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

        let receiverId;

        // Company reviewing selected applicant

        if (req.user.role === "company") {

            if (task.postedBy.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized"
                });
            }

            receiverId = task.selectedApplicant;
        }

        // Individual reviewing company

        else if (req.user.role === "individual") {

            if (task.selectedApplicant.toString() !== req.user.userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized"
                });
            }

            receiverId = task.postedBy;
        }

        // Duplicate review check

        const existingReview = await Review.findOne({
            taskId,
            reviewerId: req.user.userId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await Review.create({
            taskId,
            reviewerId: req.user.userId,
            receiverId,
            rating,
            comment
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