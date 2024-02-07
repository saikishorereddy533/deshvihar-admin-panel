module.exports = (req, res, next) => {
    // Check if the user is logged in
    if (req.session.isLoggedIn) {
      // User is authenticated
      return next();
    }
  
    // User is not authenticated, redirect to login page or perform other actions
    res.redirect("/auth/login");
  };
  