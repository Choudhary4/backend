const Conference = require('../models/Conference'); 

const User = require('../models/User')

// Create a new Research Conference
exports.createConference = async (req, res) => {
  try {
    // Destructure the conference data from the request body
    const { name, picture, organizer, startDate, endDate, location, category, journals, venue } = req.body;

    if(!name || !organizer || !category || !venue || !location){
        return res.status(404).json({
            success:false,
            message:"Please fill all fields"
        })
    }


      // Get user ID from the authenticated request (ensure req.user is set properly)
      const userId = req.user.id;

      const userDetail = await User.findById(userId);
      if (!userDetail) {
          return res.status(404).json({
              success: false,
              message: "User Not Found"
          });
      }


    // Create a new instance of the ResearchConference model
    const newConference = new Conference({
      name,
      picture,
      organizer,
      startDate,
      endDate,
      location,
      category,
      venue,
      user: userDetail._id
    });

    // Save the new conference to the database
    const savedConference = await newConference.save();

    await User.findByIdAndUpdate(
        { _id: userDetail._id },
        { $push: { conferences: savedConference._id } },
        { new: true }
    );

    // Send a response with the saved conference
    res.status(201).json({
      success: true,
      message: 'Research Conference created successfully!',
      conference: savedConference
    });

  } catch (error) {
    console.error('Error creating conference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conference',
      error: error.message
    });
  }
};



// Get all Research Conferences
exports.getAllConference = async (req, res) => {
  try {
    // Fetch all conferences from the database
    const conferences = await Conference.find({},{
        name:true,
        picture:true,
        organizer:true,
        startDate:true,
        endDate:true,
        location:true,
        category:true,
        venue:true,

    })
      .populate('journals') 
      .populate('ratingAndReviews') 
      .sort({ startDate: -1 }); // Sort conferences by startDate in descending order

    // If no conferences are found
    if (!conferences || conferences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No conferences found.'
      });
    }

   
    res.status(200).json({
      success: true,
      conferences: conferences
    });

  } catch (error) {
    console.error('Error fetching conferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conferences.',
      error: error.message
    });
  }
};



// Find conferences by organizer and date range (startDate or endDate)
exports.Conference = async (req, res) => {
  try {
    
    const { organizer, startDate, endDate } = req.query;


    let query = {};

    
    if (organizer) {
      query.organizer = { $regex: organizer, $options: 'i' }; 
    }

   
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) }; 
    }

    
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) }; 
    }

  
    const conferences = await Conference.find(query)
      .populate('journals') 
      .populate('ratingAndReviews') 
      .sort({ startDate: 1 }); // Sort by startDate in ascending order

    // If no conferences are found
    if (!conferences || conferences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No conferences found matching the criteria.'
      });
    }

    // Return the found conferences
    res.status(200).json({
      success: true,
      conferences
    });

  } catch (error) {
    console.error('Error fetching conferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conferences.',
      error: error.message
    });
  }
};



  