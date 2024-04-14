const Todos = require("../models/Todos")
const State = require("../models/State")
const mongoose = require('mongoose');
const cloudinary = require("cloudinary").v2;
const Feature = require("../models/Feature")
const Image=require('../models/imageSchema')
require("dotenv").config();
// configure cloudinary        
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env. api_key, 
  api_secret:  process.env.api_secret 
});

exports.addTodo = (req, res, next) => {
    const { stateId } = req.params;
    res.render("admin/addtodo",{todo:null , stateId});
};

exports.editTodo = async (req, res) => {
    try {
      const todo = await Todos.findById(req.params.id).populate('featureIds');
      if (!todo) {
        return res.status(404).send({ message: 'Todo not found' });
      }
  
      const features = todo.featureIds.map(feature => ({
        name: feature.name,
        id: feature._id,
      }));
  
      res.render('admin/addtodo', { todo, features });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error' });
    }
  };

  exports.createTodo = async (req, res) => {
    try {
      const { type, name, location, openingTime, closingTime } = req.body;
      console.log(req.body)
      const stateId = mongoose.Types.ObjectId(req.params.stateId);
      // Upload images to Cloudinary
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        uploadedImages.push(result.secure_url);
      }
      
  
      // Check if the state exists
      const state = await State.findById(stateId);
      if (!state) {
        return res.status(404).send({ message: 'State not found' });
      }
  
      // Check if a Todo for this state already exists
      let todo = await Todos.findOne({ stateId: stateId });
  
      // If a Todo doesn't exist, create a new one
      if (!todo) {
        todo = new Todos({ stateId: stateId });
      }
  
      // Append the new todoType to the ttd array
      todo.ttd.push({ type, imageArray: uploadedImages, name, location, openingTime, closingTime });
  
      // Save the Todo
      await todo.save();
  
      // Add the Todo ID to the state
      state.todoId = todo._id;
      await state.save();
  
      res.status(201).send({ message: 'Todo created successfully', todo });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error' });
    }
  };  
  


exports.getStateDetails = async (req, res) => {
    try {
      const { stateId } = req.params;
  
      // Fetch the state details
      const state = await State.findById(stateId);
      if (!state) {
        return res.status(404).send({ message: 'State not found' });
      }
  
      // Fetch the todos associated with the state
      const todo = await Todos.find({ _id: { $in: state.todoId } });
      console.log(todo)
      // Render the EJS template and pass the state and todos data to it
      res.render('admin/state-details', { state, todo });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error' });
    }
  };



exports.addFeatureToTodo = (req, res, next) => {
    const { stateId } = req.params;
    res.render("admin/addFeature",{ stateId});
};

exports.postFeatureToTodo = async (req, res, next) => {
  try {
    let featureData = JSON.parse(req.body.featureData);
    console.log(featureData)
    console.log(req.files)
    // Upload icon to Cloudinary
    const iconResult = await cloudinary.uploader.upload(req.files['icon'][0].path);
    featureData.icon = iconResult.secure_url;

    console.log(featureData.subFeatures)
    // Upload event images to Cloudinary
    for (const subFeature of featureData.subFeatures) {
      for (let i = 0; i < subFeature.events.length; i++) {
        const event = subFeature.events[i];
        const eventImageFile = req.files[`eventImage${i}`][0];
        const eventResult = await cloudinary.uploader.upload(eventImageFile.path);
        event.image = eventResult.secure_url;
      }
    }

    const newFeature = new Feature(featureData);
    await newFeature.save();

    // After successful creation of feature, add featureId to the corresponding Todo
    const stateId = req.body.stateId;

    const todo = await Todos.findOne({ stateId });
    if (todo) {
      todo.featureIds.push(newFeature._id);
      await todo.save();
    } else {
      console.error('Todo not found for the provided stateId:', stateId);
    }

    res.status(201).json('Feature added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Failed to add feature');
  }
}


// Controller function to get all states
exports.getAllStates = async (req, res) => {
  try {
    // Fetch all states from the database
    const states = await State.find({}, { name: 1, _id: 1 });

    // If no states found, send 404 Not Found status
    if (!states || states.length === 0) {
      return res.status(404).json({ message: 'No states found' });
    }

    // Send states as JSON response
    res.json(states);
  } catch (error) {
    // Handle errors
    console.error('Error fetching states:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getStateById = async (req, res, next) => {
  try {
    const stateId = req.params.stateId;
    const state = await State.findById(stateId)
      .populate({
        path: 'todoId',
        model: Todos,
        populate: {
          path: 'featureIds',
          model: Feature
        }
      });
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    res.status(200).json(state);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


//adding new controller to add images of state ad city globally

exports.imageUploder=async (req,res,next)=>{
  try {
    // Retrieve URLs of uploaded images from req.files
    const stateImageUrl = req.files['stateImage'][0].path; // Assuming Multer saves the image to disk
    const cityImageUrl = req.files['cityImage'][0].path; // Assuming Multer saves the image to disk

    // Upload images to Cloudinary and obtain secure URLs
    const stateImageCloudinary = await cloudinary.uploader.upload(stateImageUrl);
    const cityImageCloudinary = await cloudinary.uploader.upload(cityImageUrl);

    // Create a new document in the database with state and city names and image URLs
    const newImage = new Image({
        stateImage: stateImageCloudinary.secure_url,
        cityImage: cityImageCloudinary.secure_url
    });

    // Save the new document
    await newImage.save();

    // Send the URLs of the uploaded images back to the client as JSON data
    res.status(201).json({
        stateImageUrl: stateImageCloudinary.secure_url,
        cityImageUrl: cityImageCloudinary.secure_url
    });
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
}
}