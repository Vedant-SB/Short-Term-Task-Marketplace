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
                "first_year_student",
                "second_year_student",
                "third_year_student",
                "final_year_student",
                "fresh_graduate",
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

        // Last date users can apply
        applicationDeadline: {
            type: Date,
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
                "revision_requested",
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

        // Set when company accepts an applicant
        taskStartDate: {
            type: Date,
            default: null
        },

        // Initial deadline = taskStartDate + duration
        originalDeadline: {
            type: Date,
            default: null
        },

        // Current deadline after extensions
        currentDeadline: {
            type: Date,
            default: null
        },

        // Keeps history of every extension
        deadlineExtensions: [
            {
                days: {
                    type: Number,
                    required: true,
                    min: 1
                },

                reason: {
                    type: String,
                    default: ""
                },

                previousDeadline: {
                    type: Date,
                    required: true
                },

                newDeadline: {
                    type: Date,
                    required: true
                },

                extendedAt: {
                    type: Date,
                    default: Date.now
                },

                extendedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                }
            }
        ],

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
        },

        revisionReason: {
            type: String,
            default: ""
        },

        revisionExpectedChanges: {
            type: String,
            default: ""
        },

        revisionRequestedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Dashboard queries
taskSchema.index({
    status: 1,
    category: 1,
    postedBy: 1
});

// Open tasks by application deadline
taskSchema.index({
    status: 1,
    applicationDeadline: 1
});

// Active tasks by submission deadline
taskSchema.index({
    status: 1,
    currentDeadline: 1
});

module.exports = mongoose.model("Task", taskSchema);