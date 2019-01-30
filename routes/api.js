/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 
MongoClient.connect(CONNECTION_STRING, function(err, db) {
  if(err) {throw err;}
  
  const dbo = db.db("fcc-challenges-db");  
  
  dbo.createCollection('issues', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ['issue_title', 'issue_text', 'created_by'],
        properties: {
          issue_title: {
            bsonType: "string",
            description: "must be a string and is required"},
          issue_text: {
            bsonType: "string",
            description: "must be a string and is required"},
          created_by: {
            bsonType: "string",
            description: "must be a string and is required"},
          assigned_to: {
            bsonType: "string",
            description: "must be a string and is required"},
          status_text: {
            bsonType: "string",
            description: "must be a string and is required"},
          created_on: {
            bsonType: "date"},
          updated_on: {
            bsonType: "date"},
          open: {
            bsonType: "bool"}    
        }
      }
    }
  },function(err, result){
    if(err) {throw err;}
    
    console.log("Collection created!"); 
    db.close();
  });


});


module.exports = function (app) {

  app.route('/api/issues/:project') // /api/issues/apitest?open=true
  
    .get(function (req, res){
      var project = req.params.project;
      var searchQuery = req.query;
      if (searchQuery._id) { 
        searchQuery._id = new ObjectId(searchQuery._id);}
      if (searchQuery.open == "true") {searchQuery.open = true;} else {searchQuery.open = false;}

      console.log("SHOW THE SEARCH QUERY " + JSON.stringify(searchQuery));
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) {throw err;}
  
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('issues').find(searchQuery).toArray(function(err, result) {
          if (err) throw err;
          res.json(result);          
        });
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue = {
        issue_title: req.body.issue_title, //escape special chars
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true};
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) {throw err;}
  
        const dbo = db.db("fcc-challenges-db");
        dbo.collection('issues').insertOne(issue, function(err, result) {
          if (err) throw err;
          
          issue._id = result.insertedId;
          res.json(issue); 
          console.log("1 document inserted " + result.insertedId);
          db.close();
        });
      });
    })
    
    .put(function (req, res) {
      var project = req.params.project;
      var updateObj = {};
      if (req.body.issue_title) {updateObj.issue_title = req.body.issue_title;}
      if (req.body.issue_text) {updateObj.issue_text = req.body.issue_text;}
      if (req.body.created_by) {updateObj.created_by = req.body.created_by;}
      if (req.body.assigned_to) {updateObj.assigned_to = req.body.assigned_to;}
      if (req.body.status_text) {updateObj.status_text = req.body.status_text;}
      if (req.body.open==="false") {updateObj.open = false;}
      if (updateObj == {}) {
        res.send("no updated field sent");
      }
      else {
        updateObj.updated_on = new Date();
    
        MongoClient.connect(CONNECTION_STRING, function(err,db) {
          if(err) {throw err;}

          const dbo = db.db("fcc-challenges-db");
          dbo.collection('issues').findOneAndUpdate({_id: ObjectId(req.body._id)}, {$set: updateObj}, {returnOriginal : false},  function (err, result) {
            if(err) {
              res.send("could not update " + req.body._id); 
              db.close();}                   

            res.send("successfully updated");
            db.close();
          });                 
        }); 
        
      }
    }) 
    
    .delete(function (req, res){
      var project = req.params.project;
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if (err) throw err;
        console.log("is anyone there???");

        const dbo = db.db("fcc-challenges-db");
        try {
        dbo.collection('issues').findOneAndDelete({_id: ObjectId(req.body._id)}, {}, function(err, result) {
          if(err) {throw err;}

          if(result.value==null) {
            res.send("could not delete " + req.body._id); 
          } else {
            res.send("deleted "+ req.body._id); }   

          db.close();
        });
        }
        catch(e){
          res.send('_id error');}
      });
    });
    
};
