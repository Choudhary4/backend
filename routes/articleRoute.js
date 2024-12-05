const express = require("express")
const router = express.Router();


// Article Controllers Import
const {createArticle,
       getAllArticles,
       getArticlesDetails,
       getArticles
      } = require("../controllers/articleController")

const {
      createCategory,
      showAllCategories,
      categoryPageDetails
}  = require('../controllers/categoryController')

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/authMiddleware")


// ********************************************************************************************************
//                                      article routes
// ********************************************************************************************************

router.post("/createArticle",auth,isStudent,createArticle)

router.get("/getAllArticles",getAllArticles)

router.post("/getArticleDetails",getArticlesDetails)
router.post("/getArticles",getArticles)



// ********************************************************************************************************
//                                      category routes
// ********************************************************************************************************

router.post("/ createCategory",auth,isAdmin,createCategory)
router.get("/showAllCategories",showAllCategories)
router.get("/categoryPageDetails",categoryPageDetails)



// ********************************************************************************************************
//                                      Journal routes
// ********************************************************************************************************

const {createJournal,
      getAllJournal,
      getJournal
}   = require('../controllers/journalController')


router.post("/createJournal",auth,isStudent,createJournal)
router.get("/getAllJournal",getAllJournal)
router.get("/getJournal", getJournal)





// ********************************************************************************************************
//                                      Journal routes
// ********************************************************************************************************

const {
      createConference,
      getAllConference,
      Conference
}  = require('../controllers/conferenceController')



router.post("/createConference",auth,isStudent,createConference)
router.get("/getAllConference",getAllConference)
router.get("/Conference",Conference)


module.exports = router