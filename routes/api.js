/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
  if(err) {throw err;}
  
  const dbo = db.db("fcc-challenges-db");  
  dbo.createCollection('books', function (err, result){
    if (err) {throw err;}
    
    console.log("collection created");
  });
});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').find({}).toArray(function(err, result) {
          if (err) {throw err;}
          
          res.json(result);
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including at least _id and title
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        //findOneAndUpdate({_id: ObjectId(req.body._id)}
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').insertOne({title: title}, function(err, result) {
          if(err) {throw err;}
          
          res.json({title: title, _id: result.insertedId});
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').deleteMany({}, function(err, result) {
          if(err) {throw err;}
          console.log("delete");
          res.send("complete delete successful");
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      var bookid = req.params.id;
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').findOne({_id: ObjectId(bookid)}, function(err, result) {
          if(err) {throw err;}
          
          console.log("");
          res.json(result);
        });
      });    
    })
    
    .post(function(req, res){ //json res format same as .get
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').findOneAndUpdate({_id: ObjectId(bookid)},{$push: {comments: comment}}, function(err, result) {
          if(err) {throw err;}
          
          console.log("");
          res.json(result);
        });
      });   
      
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err,db) {
        if(err) {throw err;}
        
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('books').deleteOne({_id: ObjectId(bookid)}, function(err, result) {
          if(err) {throw err;}
          
          console.log("book deleted");
          res.send("delete successful");
        });
      });   
    });
  
};
