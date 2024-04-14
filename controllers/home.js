const State = require("../models/State")
const cloudinary = require("cloudinary").v2;
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env. api_key, 
  api_secret:  process.env.api_secret 
});
exports.getIndex = (req, res, next) => {

    res.render("home/index");
  };


  exports.getStateDetailsJSON = async (req, res) => {
    try {
      const stateName = req.params.stateName;
  
      // Find the state by name
      const state = await State.findOne({ name: stateName });
  
      if (!state) {
        return res.status(404).json({ error: 'State not found' });
      }
  
      // Send the state details as JSON
      res.json(state);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  exports.getStateDetail = (req, res) => {
    const stateName = req.params.stateName;
    console.log("state name is ",stateName)
    State.findOne({ name: stateName })
      .then((state) => {
        if (state) {
          // State exists, render the details with editable fields
          res.render('home/stateDetail', { state,stateName, errors: [] });
        } else {
          // State doesn't exist, render an empty form
          res.render('home/stateDetail', { state: null,stateName, errors: [] });
        }
      })
      .catch((err) => {
        console.error('Error fetching state details:', err);
        res.status(500).send('Internal Server Error');
      });
  };

  exports.postCreateState = async (req, res) => {
    const { name, overview, area, languages, stdcode, airports, railwayStations, busStops,location,names} = req.body;
    const stateNames=names.split(',').map(value=>value.trim())
    const images = req.files['images'];
    const overviewImage = req.files['overviewImage']; // Assuming only one state image is uploaded
    const thingstodoImage = req.files['thingstodoImage'];
    const links=[]
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const result = await cloudinary.uploader.upload(image.path);
      console.log(`Uploaded image: ${result.url}, Name: ${name}`);
      links.push(result.secure_url)
  }
  console.log(overviewImage[0].path)
  const overviewImage_link= (await cloudinary.uploader.upload(overviewImage[0].path)).secure_url ;
  const thingstodoImage_link=(await cloudinary.uploader.upload(thingstodoImage[0].path)).secure_url;
  console.log(overviewImage_link)
    const newState = new State({
      name,
      overview,
      area,
      languages: languages.split(',').map(lang => lang.trim()), // Convert comma-separated string to an array
      stdcode,
      modesOfTransport: {
        air: airports.split(',').map(airport => ({ airportName: airport.trim() })),
        rail: railwayStations.split(',').map(station => ({ railwayStationName: station.trim() })),
        bus: busStops.split(',').map(busStop => ({ busStopName: busStop.trim() })),
      },
      location,//added location parameter
      stateSymbols:[],
      stateImages :{
        overviewImage: overviewImage_link,
        thingstodoImage:thingstodoImage_link
      }
    });
  
    for (let i = 0; i < links.length; i++) {
      newState.stateSymbols.push({
          stateName: stateNames[i], // Push each state name
          link: links[i] // Push corresponding link
      });
  }
    newState.save()
      .then(() => {
        console.log('State created successfully');
        res.redirect('/'); // Redirect to the home page or wherever you want
      })
      .catch((err) => {
        console.error('Error creating state:', err);
        res.render('create-state', { errors: ['Error creating state. Please try again.'] });
      });
  };