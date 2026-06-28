const Task = require("../models/Task");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (dateInput) => {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
};

const parseApplicationDeadline = (deadlineInput) => {
    if (!deadlineInput) {
        return null;
    }

    const parsed = new Date(deadlineInput);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    parsed.setHours(23, 59, 59, 999);
    return parsed;
};

const addDays = (dateInput, days) =>
    new Date(new Date(dateInput).getTime() + (Number(days) * MS_PER_DAY));

const closeExpiredApplicationTasks = async () => {
    const now = new Date();

    return Task.updateMany(
        {
            status: "open",
            applicationDeadline: { $lt: now }
        },
        {
            $set: {
                status: "closed"
            }
        }
    );
};

const computeTaskDeadline = (taskStartDate, durationDays) =>
    addDays(startOfDay(taskStartDate), Number(durationDays));

module.exports = {
    parseApplicationDeadline,
    closeExpiredApplicationTasks,
    computeTaskDeadline,
    addDays
};
