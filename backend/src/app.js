const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(helmet());
app.use(express.json());

app.use("/api/auth", authRoutes, authLimiter);
app.use("/api/tasks", taskRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);

module.exports = app;