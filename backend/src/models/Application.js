const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
{
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },

    applicantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    status:{
        type:String,
        enum:[
            "pending",
            "accepted",
            "rejected",
            "withdrawn"
        ],
        default:"pending"
    },

    appliedAt:{
        type:Date,
        default:Date.now
    }
}
);

applicationSchema.index({
    taskId: 1,
    applicantId: 1
});

module.exports = mongoose.model("Application", applicationSchema);