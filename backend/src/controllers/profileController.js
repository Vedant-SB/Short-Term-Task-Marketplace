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

        // Everyone can always view their own profile
        if (req.user.userId !== userId) {

            if (req.user.role === "individual") {

                return res.status(403).json({
                    success: false,
                    message: "You can only view your own profile"
                });

            }

            if (req.user.role === "company") {

                const companyTaskIds = await Task.distinct("_id", {
                    postedBy: req.user.userId
                });

                const hasApplied = companyTaskIds.length > 0
                    ? await Application.exists({
                        applicantId: userId,
                        taskId: {
                            $in: companyTaskIds
                        }
                    })
                    : null;

                if (!hasApplied) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "You can only view profiles of applicants who applied to your tasks"
                    });

                }

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

        const reviewSummary =
            await getUserReviewSummary(userId);

        let statistics = {};
        let profileStatus = "";
        let activeTaskCount = 0;
        let portfolio = [];

        // =====================================================
        // INDIVIDUAL PROFILE
        // =====================================================

        if (user.role === "individual") {

            const [
                completedTasks,
                applicationsAccepted,
                activeTasks,
                completedTasksData
            ] = await Promise.all([

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

            statistics = {
                averageRating: reviewSummary.averageRating,
                totalReviews: reviewSummary.reviewCount,
                completedTasks,
                portfolioProjects: completedTasks,
                applicationsAccepted,
                applicationsCompleted: completedTasks
            };

            profileStatus = "Available";

            if (
                activeTasks.some(
                    task => task.status === "revision_requested"
                )
            ) {
                profileStatus = "Revision Requested";
            }
            else if (activeTasks.length > 0) {
                profileStatus = "Working";
            }

            activeTaskCount = activeTasks.length;

            const completedTaskIds =
                completedTasksData.map(task => task._id);

            const companyReviews =
                completedTaskIds.length > 0
                    ? await Review.find({
                        task: {
                            $in: completedTaskIds
                        },
                        reviewee: userId,
                        reviewType: "company_to_individual"
                    }).select(
                        "task rating comment"
                    )
                    : [];

            const reviewByTaskId =
                new Map(
                    companyReviews.map(review => [
                        review.task.toString(),
                        review
                    ])
                );

            portfolio = completedTasksData.map(task => {

                const review =
                    reviewByTaskId.get(
                        task._id.toString()
                    );

                const item = {

                    taskId: task._id,

                    title: task.title,

                    companyName: task.postedBy?.companyName || "Company",

                    category: task.category,

                    budget: task.budget,

                    duration: task.duration,

                    skillsUsed: task.skillsRequired,

                    completedOn: task.updatedAt,

                    companyRating:
                        review?.rating || null,

                    companyReview:
                        review?.comment || null

                };

                if (req.user && req.user.userId === userId) {
                    item.submissionLink = task.submissionLink || "";
                    item.submissionNote = task.submissionNote || "";
                    item.submittedAt = task.submittedAt || null;
                }

                return item;

            });

        }

        // =====================================================
        // COMPANY PROFILE
        // =====================================================

        else {

            const [

                tasksPosted,

                openTasks,

                activeProjects,

                underReview,

                revisionRequested,

                completedProjects,

                hiredIndividuals

            ] = await Promise.all([

                Task.countDocuments({
                    postedBy: userId
                }),

                Task.countDocuments({
                    postedBy: userId,
                    status: "open"
                }),

                Task.countDocuments({
                    postedBy: userId,
                    status: "in_progress"
                }),

                Task.countDocuments({
                    postedBy: userId,
                    status: "under_review"
                }),

                Task.countDocuments({
                    postedBy: userId,
                    status: "revision_requested"
                }),

                Task.countDocuments({
                    postedBy: userId,
                    status: "completed"
                }),

                Task.distinct(
                    "selectedApplicant",
                    {
                        postedBy: userId,
                        selectedApplicant: {
                            $ne: null
                        }
                    }
                )

            ]);

            statistics = {

                averageRating:
                    reviewSummary.averageRating,

                totalReviews:
                    reviewSummary.reviewCount,

                tasksPosted,

                openTasks,

                activeProjects,

                underReview,

                revisionRequested,

                completedProjects,

                individualsHired:
                    hiredIndividuals.length

            };

            profileStatus =
                openTasks > 0
                    ? "Hiring"
                    : activeProjects > 0
                        ? "Projects In Progress"
                        : "Not Hiring";

            activeTaskCount =
                activeProjects;

            portfolio = [];
        }

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

const isValidHttpUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
};

const normalizeOptionalString = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "company") {
            const { companyName, industry, companyDescription, website } = req.body;

            if (companyName !== undefined) {
                const normName = normalizeOptionalString(companyName);
                if (!normName) {
                    return res.status(400).json({ success: false, message: "Company name is required" });
                }
                user.companyName = normName;
            }

            if (industry !== undefined) {
                const normIndustry = normalizeOptionalString(industry);
                if (!normIndustry) {
                    return res.status(400).json({ success: false, message: "Industry is required" });
                }
                user.industry = normIndustry;
            }

            if (companyDescription !== undefined) {
                const normDesc = normalizeOptionalString(companyDescription);
                if (!normDesc || normDesc.length < 30 || normDesc.length > 500) {
                    return res.status(400).json({
                        success: false,
                        message: "Company description must be between 30 and 500 characters"
                    });
                }
                user.companyDescription = normDesc;
            }

            if (website !== undefined) {
                const normWeb = normalizeOptionalString(website);
                if (normWeb && !isValidHttpUrl(normWeb)) {
                    return res.status(400).json({
                        success: false,
                        message: "Website must be a valid URL (starting with http:// or https://)"
                    });
                }
                user.website = normWeb;
            }
        } else if (user.role === "individual") {
            const {
                name,
                bio,
                college,
                skills,
                github,
                portfolioWebsite,
                company,
                yearsOfExperience,
                primaryDomain,
                individualType
            } = req.body;

            if (name !== undefined) {
                const normName = normalizeOptionalString(name);
                if (!normName) {
                    return res.status(400).json({ success: false, message: "Name is required" });
                }
                user.name = normName;
            }

            if (bio !== undefined) {
                const normBio = normalizeOptionalString(bio);
                if (!normBio) {
                    return res.status(400).json({ success: false, message: "Bio is required" });
                }
                user.bio = normBio;
            }

            if (college !== undefined) {
                user.college = normalizeOptionalString(college);
            }

            if (skills !== undefined) {
                user.skills = Array.isArray(skills)
                    ? skills.map(s => String(s || "").trim()).filter(Boolean)
                    : typeof skills === "string"
                    ? skills.split(",").map(s => s.trim()).filter(Boolean)
                    : [];
            }

            if (github !== undefined) {
                user.github = normalizeOptionalString(github);
            }

            if (portfolioWebsite !== undefined) {
                const normPort = normalizeOptionalString(portfolioWebsite);
                if (normPort && !isValidHttpUrl(normPort)) {
                    return res.status(400).json({
                        success: false,
                        message: "Portfolio website must be a valid URL (starting with http:// or https://)"
                    });
                }
                user.portfolioWebsite = normPort;
            }

            if (company !== undefined) {
                user.company = normalizeOptionalString(company);
            }

            if (yearsOfExperience !== undefined) {
                user.yearsOfExperience = Number(yearsOfExperience) || 0;
            }

            if (primaryDomain !== undefined) {
                user.primaryDomain = normalizeOptionalString(primaryDomain);
            }

            if (individualType !== undefined && individualType) {
                user.individualType = individualType;
            }
        }

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPublicProfile,
    updateProfile
};
