const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
authors: [{
    name: {
        type: String,
        required: true,
        trim: true
    },
    affiliation: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        match: /.+\@.+\..+/,
        trim: true
    }
}],
  picture:{
    type:String
 },
 category: {
    type: [String],
    default: []
  },


  publicationDate: {
    type: Date,
    required: true
},

volume: {
    type: Number,
    min: 1
},
issue: {
    type: Number,
    min: 1
},

pages: {
    start: {
        type: Number,
        min: 1
    },
    end: {
        type: Number,
        min: 1
    }
},
venue: {
    type: String, // This field can hold the journal or conference name
    required: true
  },
  ratingAndReviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReview"

 }]
});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
