const mongoose = require("mongoose");

const isValidHttpUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
};

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
        trim: true,
        required: function () {
            return this.role === "company";
        }
    },

    companyDescription: {
        type: String,
        trim: true,
        required: function () {
            return this.role === "company";
        },
        minlength: 30,
        maxlength: 500
    },

    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) {
                    return true;
                }

                return isValidHttpUrl(value);
            },
            message: "Website must be a valid URL"
        }
    },

    // =========================
    // INDIVIDUAL FIELDS
    // =========================

    individualType: {
        type: String,
        enum: [
            "student",
            "first_year_student",
            "second_year_student",
            "third_year_student",
            "final_year_student",
            "fresh_graduate",
            "professional",
            "freelancer"
        ]
    },

    name: {
        type: String,
        trim: true
    },

    bio: {
        type: String,
        trim: true,
        required: function () {
            return this.role === "individual";
        }
    },

    github: {
        type: String,
        trim: true
    },

    portfolioWebsite: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) {
                    return true;
                }

                return isValidHttpUrl(value);
            },
            message: "Portfolio website must be a valid URL"
        }
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

userSchema.index({
    email: 1
}, {
    unique: true
});

module.exports = mongoose.model("User", userSchema);