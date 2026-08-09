require("dotenv").config();

const mongoose = require("mongoose");
const Task = require("./src/models/Task");
const User = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI;

const SEED_COUNT = 50;

const seedTasks = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected.");

        // Find an existing company to own the seeded tasks
        const company = await User.findOne({ role: "company" }).select("_id companyName");

        if (!company) {
            throw new Error(
                "No company user found. Create a company account first, then run the seed script."
            );
        }

        console.log(
            `Using company: ${company.companyName || company._id}`
        );

        // Remove only previously seeded tasks
        const deleteResult = await Task.deleteMany({
            title: /^Pagination Test Task/
        });

        console.log(`Removed ${deleteResult.deletedCount} old test tasks.`);

        const tasks = [];

        const categories = [
            "Development",
            "Design",
            "Data",
            "Writing",
            "Research",
            "Marketing",
            "Other"
        ];

        const skills = [
            ["React", "JavaScript"],
            ["Node.js", "Express"],
            ["MongoDB", "Backend"],
            ["Python", "Data Analysis"],
            ["UI/UX", "Figma"],
            ["Machine Learning", "Python"],
            ["HTML", "CSS"]
        ];

        const now = new Date();

        for (let i = 1; i <= SEED_COUNT; i++) {
            const applicationDeadline = new Date(now);
            applicationDeadline.setDate(
                applicationDeadline.getDate() + 10 + i
            );

            tasks.push({
                title: `Pagination Test Task ${i}`,
                description:
                    `This is a test task created specifically to verify TaskHub pagination and infinite scrolling. Test task number ${i}.`,
                category: categories[(i - 1) % categories.length],
                skillsRequired: skills[(i - 1) % skills.length],
                eligibleFor: [
                    "student",
                    "professional",
                    "freelancer"
                ],
                budget: 1000 + i * 250,
                duration: [3, 4, 5, 6, 7][(i - 1) % 5],
                applicationDeadline,
                deliverables: [
                    "Complete the assigned work",
                    "Submit final deliverable"
                ],
                eligibilityAndPreferences: [
                    "Good communication",
                    "Able to meet the deadline"
                ],
                status: "open",
                postedBy: company._id
            });
        }

        const insertedTasks = await Task.insertMany(tasks);

        console.log(
            `Successfully created ${insertedTasks.length} test tasks.`
        );

        console.log("\nPagination test data is ready.");
        console.log("Expected pages with limit=12:");
        console.log("Page 1 → 12 tasks");
        console.log("Page 2 → 12 tasks");
        console.log("Page 3 → 12 tasks");
        console.log("Page 4 → 12 tasks");
        console.log("Page 5 → 2 tasks");

    } catch (error) {
        console.error("Seeding failed:");
        console.error(error.message);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
};

seedTasks();