const mongoose = require('mongoose')
const { stringify } = require('querystring')

const categorySchema = new mongoose.Schema({
    name:{
        type:String

    },
    description:{
        type:String
    },
    article:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Article",
        required:true
    }]
})

module.exports = mongoose.model("Category",categorySchema)