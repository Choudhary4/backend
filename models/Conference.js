const mongoose = require('mongoose');

const researchConferenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
picture:{
    type:String
 },
  organizer: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: [String],  // Array to store topics covered in the conference
    default: []
  },
  journals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Journal"  
  }],
  venue: {
    type: String, // This could be the venue name (hotel, university, etc.)
    required: true
  },
  ratingAndReviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "RatingAndReview"  
  }]
});

const ResearchConference = mongoose.model('ResearchConference', researchConferenceSchema);

module.exports = ResearchConference;
