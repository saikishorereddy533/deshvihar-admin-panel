const express = require("express");
const multer = require("multer")
const homeController = require("../controllers/home");
const isAuthenticated = require("../middleware/isAuthenticated")

const router = express.Router();

// configure multer storage
const storage = multer.diskStorage({
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

// configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB max file size
  },
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
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