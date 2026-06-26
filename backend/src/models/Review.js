const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reviewee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reviewType: {
            type: String,
            enum: [
                "company_to_individual",
                "individual_to_company"
            ],
            required: true
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        comment: {
            type: String,
            trim: true,
            required: true
        }
    },
    {
        timestamps: true
    }
);

reviewSchema.index({
    task: 1,
    reviewType: 1
}, {
    unique: true
});

module.exports = mongoose.model("Review", reviewSchema);