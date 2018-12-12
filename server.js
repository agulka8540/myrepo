const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' );

var UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
});
var User = mongoose.model('User', UserSchema);

var ExerciseSchema = mongoose.Schema({
  userId: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, required: false}
});
var Exercise = mongoose.model('Exercise', ExerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Create a New User
app.post('/api/exercise/new-user', function(req, res) { 
  
  User.findOne({username: req.body.username}, 'username', function(err, data) {//check if the user exists in DB
    if (err) {throw err;}
    
    if (data == null) { //if he doesn't, create the entry and save it
      var newUser = new User({
        username: req.body.username}); 
      
      newUser.save(function(err, data) {
        if (err) {throw err;}
        res.json({userId: data['_id'], username: req.body.username});
      });
    }    
    else { //if he does
      res.send("Username " + req.body.username + " with userId: "+ data['_id']+ " already exists!");
    }
  }); 
});

//Add exercises
app.post('/api/exercise/add', function(req, res) {
  var idFromUser = req.body.userId.trim();
  User.findOne({_id: idFromUser}, function(err, foundData) {//validate the userId
    if(err) {throw err;}
    
    if (foundData == null) {//if userId cannot be found 
      res.send("Incorrect UserId!");    
    }
    else {//if userId valid create and save the new exercise entry
      var newExercise = new Exercise({
        userId: idFromUser,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date});   
      newExercise.save(function(err,data) {
        if (err) {throw err;}
        res.json({username: foundData.username, userId: idFromUser, description: req.body.description, duration: req.body.duration,date: req.body.date});
      });
    }
  });
});

//GET users's exercise log
app.get('/api/exercise/log', function(req, res) {
  User.findOne({_id: req.query.userId}, function(err, data) {//validate the userId
    if(err) {throw err;} 
    
    
    if (data == null) {//if userId cannot be found 
      res.send("Incorrect UserId!");    
    }
    else {
      var logLimit=''; var logFrom=''; var logTo='';
      
      var exerciseQuery = {userId: req.query.userId};
      if(req.query.limit) {logLimit = parseInt(req.query.limit);} //if number of logs defined
        
      if (req.query.from || req.query.to) {exerciseQuery.date = {};} //create date property and fill it out below
      
      if(req.query.from) {//if begin date provided
        logFrom = new Date(req.query.from); 
        exerciseQuery.date['$gt'] = logFrom; 
      } 
      if(req.query.to) { //if end date provided 
        logTo = new Date(req.query.to);
        exerciseQuery.date['$lt'] = logTo;
      } 
      console.log(exerciseQuery);

      Exercise.find(exerciseQuery).limit(logLimit).select('description duration date')
              .exec(function(err, data) {
                if(err) {throw err;}
                res.json(data);
              });// date: {$lt: logTo}
    }
  });
});



app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
