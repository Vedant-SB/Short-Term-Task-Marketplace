const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: [
                "Development",
                "Design",
                "Data",
                "Writing",
                "Research",
                "Marketing",
                "Other"
            ],
            required: true
        },

        skillsRequired: [
            {
                type: String,
                trim: true
            }
        ],

        eligibleFor: {
            type: [String],
            enum: [
                "student",
                "professional",
                "freelancer"
            ],
            default: []
        },

        budget: {
            type: Number,
            default: 0
        },

        duration: {
            type: Number,
            enum: [3, 4, 5, 6, 7],
            required: true
        },

        deliverables: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "open",
                "in_progress",
                "under_review",
                "completed",
                "closed"
            ],
            default: "open"
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        selectedApplicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        submissionLink: {
            type: String,
            default: ""
        },

        submissionNote: {
            type: String,
            default: ""
        },

        submittedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);