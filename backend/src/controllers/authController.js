const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const registerUser = async (req, res) => {
    try {

        const {
            role,

            email,
            password,

            // Company
            companyName,
            industry,
            website,

            // Individual
            individualType,
            name,
            college,
            bio,
            github,
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
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // COMPANY
        if (role === "company") {

            if (!companyName || !industry) {
                return res.status(400).json({
                    message: "All company fields are required"
                });
            }

            await User.create({
                role,

                email: normalizedEmail,
                password: hashedPassword,

                companyName,
                industry,
                website
            });
        }

        // INDIVIDUAL
        else {

            if (!name || !individualType) {
                return res.status(400).json({
                    message: "Name and Individual Type are required"
                });
            }

            if (
                !["student", "professional", "freelancer"]
                    .includes(individualType)
            ) {
                return res.status(400).json({
                    message: "Invalid individual type"
                });
            }

            if (!skills || skills.length === 0) {
                return res.status(400).json({
                    message: "At least one skill is required"
                });
            }

            if (
                individualType === "student" &&
                !college
            ) {
                return res.status(400).json({
                    message: "College is required"
                });
            }

            if (
                individualType === "professional" &&
                (!company || yearsOfExperience === undefined)
            ) {
                return res.status(400).json({
                    message: "Company and Experience are required"
                });
            }

            if (
                individualType === "freelancer" &&
                !primaryDomain
            ) {
                return res.status(400).json({
                    message: "Primary Domain is required"
                });
            }

            await User.create({
                role,

                email: normalizedEmail,
                password: hashedPassword,

                individualType,
                name,
                college,
                bio,
                github,
                skills,

                company,
                yearsOfExperience,
                primaryDomain
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

    const user = await User.findById(
        req.user.userId
    ).select("-password");

    return res.status(200).json(user);
};

module.exports = {
    registerUser,
    loginUser,
    getProfile
}
