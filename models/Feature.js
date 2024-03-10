const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  image: String,
  category: String,
  otherlangName: String,
  LocationName: String,
  Date: Date,
  Fee: Number,
  PhnNo: String,
  About: String,
  Link1 :String,
  Link2 :String,
  Link3 :String,
});

const subFeatureSchema = new mongoose.Schema({ //Festivals,Folks&Crafts,Textiles,...
  name: String,
  events: [eventSchema],
});

const featureSchema = new mongoose.Schema({  //Art & Culture,Adventure,...
  name: String,
  icon: String,
  subFeatures: [subFeatureSchema], // Subfeatures associated with the main feature
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;