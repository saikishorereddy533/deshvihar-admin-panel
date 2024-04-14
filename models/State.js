const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  overview: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  languages: {
    type: [String],
    required: true,
  },
  stdcode: {
    type: String,
    required: true,
  },
  modesOfTransport: {
    air: [{
      airportName: {
        type: String,
        required: true,
      },
      airportCode: String,
    }],
    rail: [{
      railwayStationName: {
        type: String,
        required: true,
      },
      railwayStationCode: String,
    }],
    bus: [{
      busStopName: {
        type: String,
        required: true,
      },
      busStopCode: String,
    }],
  },
  stateSymbols:[
    {
     stateName:{type:String,required:true},
     link:{type:String,required:true}
    },
  ],
  stateImages:{
    overviewImage: {type: String,default:''}, 
    thingstodoImage:{type: String,default:''},
  }
 ,
  location:{type:String}, // added location parameter each state
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todos', // Reference to the Todos model
    default: null
  },
});

const State = mongoose.model('State', stateSchema);

module.exports = State;