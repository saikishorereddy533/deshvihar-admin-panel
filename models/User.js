const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: String,
  superUser: {
    type: Boolean,
    default:false
  },
  mobileno: Number,
  name: String,
});

module.exports = mongoose.model("User", userSchema);