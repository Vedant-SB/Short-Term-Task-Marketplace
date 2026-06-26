const Review = require("../models/Review");

const REVIEW_TYPE_BY_ROLE = {
    company: "company_to_individual",
    individual: "individual_to_company"
};

const formatReviewerName = (reviewer) => {
    if (!reviewer) {
        return "Unknown";
    }

    return reviewer.companyName || reviewer.name || reviewer.email || "Unknown";
};

const buildReviewStatus = (reviews) => {
    const companyReview =
        reviews.find(
            review =>
                review.reviewType ===
                "company_to_individual"
        ) || null;

    const individualReview =
        reviews.find(
            review =>
                review.reviewType ===
                "individual_to_company"
        ) || null;

    return {
        companyReview,
        individualReview,
        companyReviewSubmitted: !!companyReview,
        individualReviewSubmitted: !!individualReview,
        companyReviewPending: !companyReview,
        individualReviewPending: !individualReview
    };
};

const getTaskReviewStatusMap = async (taskIds) => {
    if (!taskIds || taskIds.length === 0) {
        return new Map();
    }

    const reviews = await Review.find({
        task: {
            $in: taskIds
        }
    })
        .populate("reviewer", "name companyName email")
        .populate("reviewee", "name companyName email")
        .sort({
            createdAt: 1
        });

    const reviewMap = new Map();

    reviews.forEach((review) => {
        const key = review.task.toString();

        if (!reviewMap.has(key)) {
            reviewMap.set(key, []);
        }

        reviewMap.get(key).push(review);
    });

    return reviewMap;
};

const getTaskReviewStatus = async (taskId) => {
    const reviewMap = await getTaskReviewStatusMap([
        taskId
    ]);

    return buildReviewStatus(
        reviewMap.get(taskId.toString()) || []
    );
};

const getUserReviewSummary = async (userId) => {
    const reviews = await Review.find({
        reviewee: userId
    })
        .populate("task", "title")
        .populate("reviewer", "name companyName email")
        .sort({
            createdAt: -1
        });

    const reviewCount = reviews.length;

    const averageRating = reviewCount > 0
        ? Number(
            (
                reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                ) / reviewCount
            ).toFixed(1)
        )
        : 0;

    const reviewHistory = reviews.map((review) => ({
        id: review._id,
        taskId: review.task?._id,
        taskTitle: review.task?.title || "",
        rating: review.rating,
        comment: review.comment,
        reviewer: formatReviewerName(review.reviewer),
        date: review.createdAt,
        reviewType: review.reviewType
    }));

    return {
        averageRating,
        reviewCount,
        reviewHistory
    };
};

module.exports = {
    REVIEW_TYPE_BY_ROLE,
    buildReviewStatus,
    getTaskReviewStatusMap,
    getTaskReviewStatus,
    getUserReviewSummary,
    formatReviewerName
};
