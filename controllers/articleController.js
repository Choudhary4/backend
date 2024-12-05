const Article = require("../models/Article")
const mongoose = require('mongoose')
const User = require('../models/User')
const {uploadImageToCloudinary} = require('../utils/imageUploader')
const RatingAndReview = require("../models/RatingAndReview")


const PDFDocument = require('pdfkit');
const fs = require('fs');


exports.createArticle = async (req, res) => {
    try {
        const {
            title,
            authors,
            abstract,
            category,
            introduction,
            literatureReview,
            methodology,
            results,
            discussion,
            conclusion,
            acknowledgements,
            references,
            appendices,
            figuresAndTables
        } = req.body;

        // Basic validation for required fields
        if (!title || !abstract || !introduction || !methodology || !results || !discussion || !conclusion || !category) {
            return res.status(400).json({
                success: false,
                message: "Please Fill All Required Fields"
            });
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

        // Create new article in the database
        const newArticle = await Article.create({
            title,
            authors,
            abstract,
            category,
            introduction,
            literatureReview,
            methodology,
            results,
            discussion,
            conclusion,
            acknowledgements,
            references,
            appendices,
            figuresAndTables,
            user: userDetail._id
        });

        // Generate a PDF document
        const doc = new PDFDocument();
        const pdfPath = `./pdfs/${newArticle._id}.pdf`; // Ensure the 'pdfs' directory exists

        doc.pipe(fs.createWriteStream(pdfPath));

        // Add content to the PDF
        doc.fontSize(16).text(`Title: ${title}`, { underline: true }).moveDown();
        doc.fontSize(14).text(`Authors: ${authors.map(author => `${author.name} (${author.affiliation}, ${author.email})`).join(', ')}`).moveDown();
        doc.fontSize(12).text(`Category: ${category.join(', ')}`).moveDown();
        doc.text(`Abstract: ${abstract}`).moveDown();
        doc.text(`Introduction: ${introduction}`).moveDown();
        if (literatureReview) doc.text(`Literature Review: ${literatureReview}`).moveDown();
        doc.text(`Methodology: ${methodology}`).moveDown();
        doc.text(`Results: ${results}`).moveDown();
        doc.text(`Discussion: ${discussion}`).moveDown();
        doc.text(`Conclusion: ${conclusion}`).moveDown();
        if (acknowledgements) doc.text(`Acknowledgements: ${acknowledgements}`).moveDown();
        if (references.length > 0) doc.text(`References: ${references.join('\n')}`).moveDown();
        if (appendices.length > 0) doc.text(`Appendices: ${appendices.join('\n')}`).moveDown();
        if (figuresAndTables.length > 0) doc.text(`Figures and Tables: ${figuresAndTables.join('\n')}`).moveDown();

        // Finalize the PDF and close the stream
        doc.end();

        // Update user with the new article reference
        await User.findByIdAndUpdate(
            { _id: userDetail._id },
            { $push: { articles: newArticle._id } },
            { new: true }
        );

        // Send response
        res.status(200).json({
            success: true,
            message: "Article created successfully",
            pdfPath: pdfPath
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getAllArticles = async(req,res) =>{
    try{
        const allArticles = await Article.find({}, {
            title: true,
            authors: true,
            abstract: true,
            category: true,
            introduction: true,
            literatureReview: true,
            methodology: true,
            results: true,
            discussion: true,
            conclusion: true,
            acknowledgements: true,
            references: true,
            appendices: true,
            figuresAndTables: true,
            picture: true
        }).populate("user").exec();

        if(!allArticles){
            return res.status(404).json({
                success:false,
                message:"Articles Not Found"
            })
        }

       return res.status(200).json({
            success:true,
            message:"Data fetched for allArticles successfully",
            Data:allArticles
        })


    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    
}
}


exports.getArticlesDetails = async(req,res)=>{
    try{
        // get articleId
        const {articleId} = req.body;
        // get all detail of article
        const articleDetail = await Article.findById({_id:articleId})
                                .populate({
                                    path:"user",
                                    populate:{
                                        path:"additionalDetail"
                                    }
                                })
                                .populate("category")
                                .populate("ratingAndReviews")
                                .exec();

    // validation 
    if(!articleDetail){
        return res.status(404).json({
            success:false,
            message:"Article Detail Not Found"
        })
    }

    // return response 

    return res.status(200).json({
        success:true,
        message:"Article Detail Fetched Successfully",
        data:articleDetail
    })


    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        }) 
    }
}


// articleController.js



// Function to get articles with optional search filters for author's name and date
exports.getArticles = async (req, res) => {
  try {
    const { authorName, startDate, endDate } = req.query;

    // Create a filter object
    const filter = {};

    // If `authorName` is provided, filter based on the authors array
    if (authorName) {
      filter['authors.name'] = { $regex: authorName, $options: 'i' }; 
    }

    // If `startDate` or `endDate` is provided, filter based on the article's date
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate); // Filter for articles on or after `startDate`
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate); // Filter for articles on or before `endDate`
      }
    }

    // Fetch articles based on filters
    const articles = await Article.find(filter);

    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message,
    });
  }
};
