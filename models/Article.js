const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
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
 authors: [
    {
      name: String,
       affiliation: String,
      email: String,
default: []             
    }
   ],
  abstract: {
    type: String,
    required: true,
    trim: true
  },
  picture:{
    type:String
 },
 category: {
    type: [String],
    default: []
  },
  introduction: {
    type: String,
    required: true
  },
  literatureReview: {
    type: String
  },
  methodology: {
    type: String,
    required: true
  },
  results: {
    type: String,
    required: true
  },
  discussion: {
    type: String,
    required: true
  },
  conclusion: {
    type: String,
    required: true
  },
  acknowledgements: {
    type: String
  },
  references: {
    type: [String],
    default: []
  },
  appendices: {
    type: [String],
    default: []
  },
  figuresAndTables: {
    type: [String], // This could store file paths or URLs to figures and tables.
    default: []
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  },
  ratingAndReviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReview"

 }]
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
