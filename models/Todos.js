const mongoose = require('mongoose');

const todoTypeSchema = new mongoose.Schema({
  type: String, // sit & chill,Day Picnics,Areas to visit
  name: String,
  location: String,
  imageArray: [String], // Array to store image URLs
  openingTime: String,
  closingTime: String,
});

const todosSchema = new mongoose.Schema({
    bannerImages: [String], // Array to store image URLs
    ttd: [todoTypeSchema],
    stateId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State', // Reference to the State model 
    },
    featureIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feature', // Reference to the Feature model 
    }],
  });

const Todos = mongoose.model('Todos', todosSchema);

module.exports = Todos;