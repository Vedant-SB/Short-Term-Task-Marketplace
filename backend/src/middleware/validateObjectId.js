const mongoose = require("mongoose");

const validateObjectId = (req, res, next) => {

    const id =
        req.params.id ||
        req.params.taskId ||
        req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid ID."
        });

    }

    next();

};

module.exports = validateObjectId;