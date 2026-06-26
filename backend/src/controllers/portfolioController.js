const Task = require("../models/Task");
const Review = require("../models/Review");

const getPortfolio = async (req, res) => {
    try {

        const { userId } = req.params;

        const completedTasks = await Task.find({
            selectedApplicant: userId,
            status: "completed"
        })
        .populate("postedBy", "companyName")
        .sort({ updatedAt: -1 });

        const portfolio = [];

        for (const task of completedTasks) {

            const review = await Review.findOne({
                task: task._id,
                reviewee: userId,
                reviewType: "company_to_individual"
            });

            portfolio.push({
                taskId: task._id,

                title: task.title,

                company: task.postedBy?.companyName,

                description: task.description,

                skillsUsed: task.skillsRequired,

                budget: task.budget,

                duration: task.duration,

                completedOn: task.updatedAt,

                submissionLink: task.submissionLink,

                rating: review?.rating || null,

                reviewComment: review?.comment || null
            });
        }

        res.status(200).json({
            success: true,
            totalProjects: portfolio.length,
            portfolio
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getPortfolio
}