const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const {
    getUserReviewSummary
} = require("../utils/reviewHelpers");

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

const normalizeSkills = (skills) => {
    if (!Array.isArray(skills)) {
        return [];
    }

    return skills
        .map(skill => normalizeOptionalString(skill))
        .filter(Boolean);
};

const registerUser = async (req, res) => {
    try {

        const {
            role,

            email,
            password,

            // Company
            companyName,
            industry,
            companyDescription,
            website,

            // Individual
            individualType,
            name,
            college,
            bio,
            github,
            portfolioWebsite,
            skills,
            company,
            yearsOfExperience,
            primaryDomain

        } = req.body;

        // Role Validation
        if (!["company", "individual"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Common Validation
        const normalizedEmail = normalizeOptionalString(email).toLowerCase();
        const normalizedPassword = String(password || "");

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

        // COMPANY
        if (role === "company") {

            const normalizedCompanyName = normalizeOptionalString(companyName);
            const normalizedIndustry = normalizeOptionalString(industry);
            const normalizedCompanyDescription = normalizeOptionalString(companyDescription);
            const normalizedWebsite = normalizeOptionalString(website);

            if (!normalizedCompanyName || !normalizedIndustry || !normalizedCompanyDescription) {
                return res.status(400).json({
                    message: "Company name, industry, and company description are required"
                });
            }

            if (normalizedCompanyDescription.length < 30 || normalizedCompanyDescription.length > 500) {
                return res.status(400).json({
                    message: "Company description must be between 30 and 500 characters"
                });
            }

            if (normalizedWebsite && !isValidHttpUrl(normalizedWebsite)) {
                return res.status(400).json({
                    message: "Website must be a valid URL"
                });
            }

            await User.create({
                role,

                email: normalizedEmail,
                password: hashedPassword,

                companyName: normalizedCompanyName,
                industry: normalizedIndustry,
                companyDescription: normalizedCompanyDescription,
                website: normalizedWebsite || undefined
            });
        }

        // INDIVIDUAL
        else {

            const normalizedName = normalizeOptionalString(name);
            const normalizedBio = normalizeOptionalString(bio);
            const normalizedGithub = normalizeOptionalString(github);
            const normalizedPortfolioWebsite = normalizeOptionalString(portfolioWebsite);
            const normalizedSkills = normalizeSkills(skills);

            if (!normalizedName || !individualType) {
                return res.status(400).json({
                    message: "Name and Individual Type are required"
                });
            }

            if (!normalizedBio) {
                return res.status(400).json({
                    message: "Bio is required"
                });
            }

            const validIndividualTypes = [
                "student",
                "first_year_student",
                "second_year_student",
                "third_year_student",
                "final_year_student",
                "fresh_graduate",
                "professional",
                "freelancer"
            ];

            if (!validIndividualTypes.includes(individualType)) {
                return res.status(400).json({
                    message: "Invalid individual type"
                });
            }

            if (normalizedSkills.length === 0) {
                return res.status(400).json({
                    message: "At least one skill is required"
                });
            }

            const studentTypes = [
                "student",
                "first_year_student",
                "second_year_student",
                "third_year_student",
                "final_year_student",
                "fresh_graduate"
            ];

            if (
                studentTypes.includes(individualType) &&
                !normalizeOptionalString(college)
            ) {
                return res.status(400).json({
                    message: "College is required"
                });
            }

            if (
                individualType === "professional" &&
                (
                    !normalizeOptionalString(company) ||
                    yearsOfExperience === undefined ||
                    yearsOfExperience === null ||
                    Number.isNaN(Number(yearsOfExperience))
                )
            ) {
                return res.status(400).json({
                    message: "Company and Experience are required"
                });
            }

            if (
                individualType === "freelancer" &&
                !normalizeOptionalString(primaryDomain)
            ) {
                return res.status(400).json({
                    message: "Primary Domain is required"
                });
            }

            if (normalizedPortfolioWebsite && !isValidHttpUrl(normalizedPortfolioWebsite)) {
                return res.status(400).json({
                    message: "Portfolio website must be a valid URL"
                });
            }

            await User.create({
                role,

                email: normalizedEmail,
                password: hashedPassword,

                individualType,
                name: normalizedName,
                college: normalizeOptionalString(college) || undefined,
                bio: normalizedBio,
                github: normalizedGithub || undefined,
                portfolioWebsite: normalizedPortfolioWebsite || undefined,
                skills: normalizedSkills,

                company: normalizeOptionalString(company) || undefined,
                yearsOfExperience:
                    yearsOfExperience === undefined || yearsOfExperience === null || yearsOfExperience === ""
                        ? undefined
                        : Number(yearsOfExperience),
                primaryDomain: normalizeOptionalString(primaryDomain) || undefined
            });
        }

        return res.status(201).json({
            message: "User Registered Successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "both email and password required"
            })
        }

        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "User dosen't exist"
            });
        }

        const match = await bcrypt.compare(
            password, user.password
        );

        if (!match) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        return res.status(200).json({
            token,
            role: user.role,
            userId: user._id
        });
    }

    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}



const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const reviewSummary =
            await getUserReviewSummary(req.user.userId);

        return res.status(200).json({
            ...user.toObject(),
            reviewSummary
        });
    } 
    
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile
}
