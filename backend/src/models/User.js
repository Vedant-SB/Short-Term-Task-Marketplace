const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    role: {
        type: String,
        enum: ["company", "individual"],
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: ""
    },

    // =========================
    // COMPANY FIELDS
    // =========================

    companyName: {
        type: String,
        trim: true
    },

    industry: {
        type: String,
        trim: true
    },

    website: {
        type: String,
        trim: true
    },

    // =========================
    // INDIVIDUAL FIELDS
    // =========================

    individualType: {
        type: String,
        enum: ["student", "professional", "freelancer"]
    },

    name: {
        type: String,
        trim: true
    },

    bio: {
        type: String,
        trim: true
    },

    github: {
        type: String,
        trim: true
    },

    skills: [{
        type: String,
        trim: true
    }],

    // Student

    college: {
        type: String,
        trim: true
    },

    // Professional

    company: {
        type: String,
        trim: true
    },

    yearsOfExperience: {
        type: Number,
        min: 0
    },

    // Freelancer

    primaryDomain: {
        type: String,
        trim: true
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);