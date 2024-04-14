const express = require("express");
const multer = require("multer")
const homeController = require("../controllers/home");
const isAuthenticated = require("../middleware/isAuthenticated")

const router = express.Router();
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.get("/", homeController.getIndex);
// Route to get state details (edit/create)
router.get('/states/:stateName', homeController.getStateDetail);

router.get('/states/:stateName/json', homeController.getStateDetailsJSON);

// Route to handle state creation/update
router.post('/states/create',upload.fields([
  { name: 'images', maxCount: 10 }, 
  { name: 'overviewImage', maxCount: 1 },
  { name: 'thingstodoImage', maxCount: 1 } 
]),homeController.postCreateState);

module.exports = router;