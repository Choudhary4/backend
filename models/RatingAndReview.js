const mongoose = require('mongoose')


const ratingAndReviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },
    rating:{
        type:Number
    },
    review:{
        type:String,
        required:true
    },
    article:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Article",
        index:true
    }
})

module.exports = mongoose.model("RatingAndReview",ratingAndReviewSchema)