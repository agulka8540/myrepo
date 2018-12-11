'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/     
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, function(err, db) {
  if (err) {console.log(err);}
});

var URLSchema = mongoose.Schema({
  original_url: {type: String, required: true, unique: true},
  short_url: {type: Number, required: true, unique: true}
});

var URLModel = mongoose.model('URLModel', URLSchema);
        
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false})
);

app.post('/api/shorturl/new', function(req, res) { 
  var originalURL = req.body.url;
  var shortURL = 1;

  var URL4Lookup = originalURL.match(/^https?:\/\/([^/]+)\/?.*?$/); //check for domain
  if(!URL4Lookup){
    res.json({error: "invalid url "});
  } 
  
  dns.lookup(URL4Lookup[1], function (err, addresses, family) {     
    if (err) {
      res.json({error: "invalid url"})
    }
    else {
      //check if website in DB 
      URLModel.find({original_url: originalURL}, function(err, data) {
        if (err) {throw err;}
        if (data.length == 0) { //if website not in DB
          //var docCount = URLModel.estimatedDocumentCount(); as it causes error, using Model.count() instead

          URLModel.count({}, function (err, count) {
            if (err) throw err;
            
            var newURL = new URLModel({ //create the DB entry
              original_url: originalURL,
              short_url: count+3}); 
            
            console.log(newURL);
            newURL.save(function(err, data) {
              console.log(data + " SAVED");
              if (err) throw err;
              
              res.json(data);
            });
        
          });            
        }
        else { //if website already in DB
          res.json(data);
        }
      });
    }
  });
});


//route for redirecting to original link when the shortened URL visited
app.get('/api/shorturl/:id', function(req, res) {
  
  URLModel.findOne({short_url: req.params.id}, function(err, data) {
    if (err) {throw err;}
    console.log(data);
    
    if (data == null) {//if shortened URL not in the data base
      res.send("Short URL doesn't exist!");    
    } 
    else {// if it exists, redirect to it
      res.redirect(data.original_url);
    }
  });
});



app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
