var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');


var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./models/user');

// configuration =========
var port  = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ ectended: false}));
app.use(bodyParser.json());


//use morgan to log requests to the console
app.use(morgan('dev'));



// basic route
app.get('/', function(req, res){
  res.send('Hello The API is ath http://localhost:' + port + '/api');
});



// save user
app.get('/signup', function(req,res){
    //create a sample user
    var user = new User();
    user.firstName = 'Blazenka';
    user.lastName = 'Parmakova';
    user.email = 'parmakovab@yahoo.com';
    user.username = 'parmak';
    user.password = 'password';
    //save the sample user
    user.save(function(err){
      if(err) throw err;
      console.log('User saved successfully');
      res.json({ success: true });
    });
});

// API routes

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req,res){
  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if(err) throw err;
  if(!user) {
    console.log(user);
    res.json({ success: false, message: 'Authentication failed. User not found.'});
  } else if(user) {
     // check if password matches
      if(user.password != req.body.password){
        res.json({ success: false, message: 'Authentication failed. Wrong password.'});
      } else {
        // if user is found and password is right
       // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440
        });
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token !',
          token: token
        });
      }
  }
});
});


//// route middleware to verify a token
apiRoutes.use(function(req, res, next){
  // check header or url parameters or post parameters for token
  var token = req.body.taken || req.query.token || req.headers['x-access-token'];

// decode token
  if(token){
    jwt.verify(token, app.get('superSecret'), function(err, decoded){
      if(err){
        return res.json( { success: false, message: 'Failed to authenticate token.'});
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }


});


// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req,res){
  res.json({
    message: 'Welcome to the coolest API on earth'
  });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req,res){
    User.find({}, function(err, users){
      res.json(users);
    });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// start the server
app.listen(port);
console.log('Magic happens at http://localhost' + port);
