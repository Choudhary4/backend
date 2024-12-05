const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    
    },
    accountType:{
        type:String,
        enum:["Admin","Student","instructor"],
        required:true
        
    },
    additionalDetail:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile"
    },
    articles:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Article"
}],
    image:{
        type:String,
        required:true

    },

  token:{
    type:String
  },
  resetPasswordExpire:{
    type:Date
  },
  journals:[{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"Journal"
}],
conferences:[{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"Conference"
}],
})

module.exports = mongoose.model("User",userSchema)