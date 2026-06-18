const Task = require("../models/Task");
const Application = require("../models/Application");
const Review = require("../models/Review");

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

        const companyTasks = await Task.find({
            postedBy: companyId
        }).select("_id");

        const taskIds = companyTasks.map(
            task => task._id
        );

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
                applicationsReceived
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

        const reviews = await Review.find({
            receiverId: userId
        });

        let averageRating = 0;

        if (reviews.length > 0) {

            const totalRating =
                reviews.reduce(
                    (sum, review) =>
                        sum + review.rating,
                    0
                );

            averageRating =
                totalRating / reviews.length;
        }

        res.status(200).json({
            success: true,
            dashboard: {
                applicationsSent,
                acceptedApplications,
                completedTasks,
                averageRating:
                    Number(
                        averageRating.toFixed(1)
                    )
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