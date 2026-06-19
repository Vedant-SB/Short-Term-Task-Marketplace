const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },

    reviewerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },

    comment:{
        type:String,
        trim:true
    }
},
{
    timestamps:true
}
);

reviewSchema.index({
    taskId: 1,
    reviewerId: 1
});

module.exports = mongoose.model("Review", reviewSchema);