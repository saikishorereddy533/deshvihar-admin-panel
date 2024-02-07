const State = require("../models/State")

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

  exports.postCreateState = (req, res) => {
    const { name, overview, area, languages, stdcode, airports, railwayStations, busStops } = req.body;
    
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
    });
  
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