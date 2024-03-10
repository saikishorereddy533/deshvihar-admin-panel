const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const multer = require("multer")



// Set up multer for file uploads
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

const MAX_EVENT_IMAGES = 10;  // Replace with the maximum number of event images you're expecting

const fields = [{ name: 'icon', maxCount: 1 }];
for (let i = 0; i < MAX_EVENT_IMAGES; i++) {
  fields.push({ name: `eventImage${i}`, maxCount: 1 });
}

router.get("/create-todo/:stateId", adminController.addTodo);

router.post("/create-todo/:stateId",upload.array("images", 5), adminController.createTodo);

router.get("/state-details/:stateId", adminController.getStateDetails);

router.get("/addFeature/:stateId", adminController.addFeatureToTodo);

router.get("/get-state-details/:stateId", adminController.getStateById);


router.post("/addFeature/:stateId", upload.fields(fields), adminController.postFeatureToTodo);

router.get("/get-all-states",adminController.getAllStates)


module.exports = router;