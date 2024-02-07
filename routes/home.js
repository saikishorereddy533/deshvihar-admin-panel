const express = require("express");

const homeController = require("../controllers/home");
const isAuthenticated = require("../middleware/isAuthenticated")

const router = express.Router();

router.get("/",isAuthenticated, homeController.getIndex);
// Route to get state details (edit/create)
router.get('/states/:stateName',isAuthenticated, homeController.getStateDetail);

router.get('/states/:stateName/json', homeController.getStateDetailsJSON);

// Route to handle state creation/update
router.post('/states/create',isAuthenticated, homeController.postCreateState);



module.exports = router;