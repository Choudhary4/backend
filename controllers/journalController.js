const Journal = require('../models/Journal'); 
const User = require('../models/User')
const RatingAndReview = require('../models/RatingAndReview')

const {uploadImageToCloudinary} = require('../utils/imageUploader')

// Create a new journal entry
const PDFDocument = require('pdfkit');
const docx = require('docx');

const fs = require('fs');
const path = require('path');











exports.createJournal = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      title,
      authors,
      picture,
      category,
      publicationDate,
      volume,
      issue,
      pages,
      venue,
    } = req.body;

    // Validate the required fields are present
    if (!title || !publicationDate || !venue) {
      return res.status(400).json({ message: 'Title, publication date, and venue are required.' });
    }

    // User validation
    const userId = req.user.id;
    const userDetail = await User.findById(userId);
    if (!userDetail) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    // Create a new Journal document
    const newJournal = new Journal({
      title,
      authors,
      picture,
      category,
      publicationDate,
      volume,
      issue,
      pages,
      venue,
      user: userDetail._id,
    });

    // Save the journal to the database
    await newJournal.save();

    // Update user with the new article reference
    await User.findByIdAndUpdate(
      { _id: userDetail._id },
      { $push: { journals: newJournal._id } },
      { new: true }
    );

    // Ensure category is an array before using join
    const categoryFormatted = Array.isArray(category) ? category.join(', ') : category;

    // Format authors into a string
    const authorsFormatted = authors.map((author) => author.name).join(', ');

    // Generate PDF
    const pdfFilePath = path.join(__dirname, 'journals', `${newJournal.title}.pdf`);
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(pdfFilePath));

    pdfDoc.fontSize(18).text(`Title: ${newJournal.title}`, { align: 'center' });
    pdfDoc.fontSize(14).text(`Authors: ${authorsFormatted}`, { align: 'center' });
    pdfDoc.text(`Category: ${categoryFormatted}`);
    pdfDoc.text(`Publication Date: ${new Date(newJournal.publicationDate).toLocaleDateString()}`);
    pdfDoc.text(`Volume: ${newJournal.volume}`);
    pdfDoc.text(`Issue: ${newJournal.issue}`);
    pdfDoc.text(`Pages: ${newJournal.pages.start} - ${newJournal.pages.end}`);
    pdfDoc.text(`Venue: ${newJournal.venue}`);
    pdfDoc.end();

    // Generate DOCX
    const docxFilePath = path.join(__dirname, 'journals', `${newJournal.title}.docx`);
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: 'Journal Information',
              heading: docx.HeadingLevel.HEADING_1,
              alignment: docx.AlignmentType.CENTER,
            }),
            new docx.Paragraph(`Title: ${newJournal.title}`),
            new docx.Paragraph(`Authors: ${authorsFormatted}`),
            new docx.Paragraph(`Category: ${categoryFormatted}`),
            new docx.Paragraph(
              `Publication Date: ${new Date(newJournal.publicationDate).toLocaleDateString()}`
            ),
            new docx.Paragraph(`Volume: ${newJournal.volume}`),
            new docx.Paragraph(`Issue: ${newJournal.issue}`),
            new docx.Paragraph(`Pages: ${newJournal.pages.start} - ${newJournal.pages.end}`),
            new docx.Paragraph(`Venue: ${newJournal.venue}`),
          ],
        },
      ],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docxFilePath, buffer);

    // Upload files to Cloudinary using the provided function
    const pdfUpload = await uploadImageToCloudinary(
      { tempFilePath: pdfFilePath },
      'journals',
      null,
      null
    );

    const docxUpload = await uploadImageToCloudinary(
      { tempFilePath: docxFilePath },
      'journals',
      null,
      null
    );

    console.log("files",docxUpload)

    // Delete local files after uploading
    fs.unlinkSync(pdfFilePath);
    fs.unlinkSync(docxFilePath);

    // Send a response with the created journal and file URLs
    res.status(201).json({
      message: 'Journal created successfully',
      journal: newJournal,
      pdfUrl: pdfUpload.secure_url,
      docxUrl: docxUpload.secure_url,
    });
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).json({
      message: 'An error occurred while creating the journal',
      error: error.message,
    });
  }
};




exports.getAllJournal = async (req,res)=>{
    try{
        const allJournal = await Journal.find({},{
            title:true,
            authors:true,
            picture:true,
            category:true,
            publicationDate:true,
            volume:true,
            issue:true,
            pages:true,
            venue:true

        }).populate('user').exec();

        if(!allJournal){
            return res.status(404).json({
                success:false,
                message:"Journal Not Found"
            })
        }
     
        console.log("Journal",allJournal)
        return res.status(200).json({
            success:true,
            message:"Journal  Found",
            data:allJournal

        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    
    }
}


// Function to get journals with optional search filters for author's name and date
// controller for fetching journals
exports.getJournal = async (req, res) => {
    try {
      const { authorName, startDate, endDate } = req.query;
      
      // Initialize the filter object
      const filter = {};
  
      // Filter by author name (case-insensitive search)
      if (authorName) {
        filter['authors.name'] = { $regex: authorName, $options: 'i' }; 
      }
  
      // Filter by date range (publicationDate)
      if (startDate || endDate) {
        filter.publicationDate = {};
        
        if (startDate) {
          // Check for valid start date format
          if (isNaN(new Date(startDate))) {
            return res.status(400).json({ success: false, message: 'Invalid start date format' });
          }
          filter.publicationDate.$gte = new Date(startDate); 
        }
        
        if (endDate) {
          // Check for valid end date format
          if (isNaN(new Date(endDate))) {
            return res.status(400).json({ success: false, message: 'Invalid end date format' });
          }
          filter.publicationDate.$lte = new Date(endDate); 
        }
      }
  
      // Fetch the journals from the database
      const journals = await Journal.find(filter);
  
      // If no journals match the filter, return a message
      if (journals.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No journals found matching the criteria',
        });
      }
  
      // Return the fetched journals
      res.status(200).json({
        success: true,
        data: journals,
      });
  
    } catch (error) {
      console.error('Error fetching journals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch journals',
        error: error.message,
      });
    }
  };
  
  