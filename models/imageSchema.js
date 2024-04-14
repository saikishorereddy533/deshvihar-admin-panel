const mongoose = require('mongoose');
const { Schema } = mongoose;

const imageSchema = new Schema({

    stateImage: { type: String }, // URL of the state image
    cityImage: { type: String }, // URL of the city image
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
