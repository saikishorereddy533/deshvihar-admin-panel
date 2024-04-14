const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const methodOverride = require('method-override');
require("dotenv").config();

const mongoDBstore = require("connect-mongodb-session")(session);
const store = new mongoDBstore({
  uri: process.env.DB_URL,
  collection: "sessions",
});

const errorController = require("./controllers/error");
const User = require("./models/User");
const accessLogStreams = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
// Parse JSON-encoded request bodies
app.use(express.json());
app.use(methodOverride('_method'));


const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const adminRoutes = require("./routes/admin");


app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStreams }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "skreddyyyyy56788",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


//to avoid pages to display on pressing back after logout due to cache
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});



//global middleware to make session available in ejs
app.use((req,res,next)=>{
  res.locals.session=req.session;
  next();
})

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
app.use(flash());

app.use(homeRoutes);
app.use("/auth",authRoutes);
app.use("/admin",adminRoutes);
app.use(errorController.get404);


app.listen(process.env.PORT ||3000 ,()=>{
  console.log("server running...")
})

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Adjust the timeout value as per your needs
});

// Handle initial connection error
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle connection timeout
mongoose.connection.on('timeout', () => {
  console.error('MongoDB connection timeout');
  // Perform any necessary actions (e.g., reconnect, show error page, etc.)
});

// Handle connection success
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});


// Define your default error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err); // Log the error for debugging purposes
  
  // Render a default error page or JSON response
  res.status(500).send('Oops! Something went wrong.');
}

// Place this middleware at the end of your middleware chain
app.use(errorHandler);