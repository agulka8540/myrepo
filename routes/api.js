/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var MongoClient          = require('mongodb');
var expect               = require('chai').expect;
const CONNECTION_STRING  = process.env.DB;
var ObjectId             = require('mongodb').ObjectID;



MongoClient.connect(CONNECTION_STRING, function(err, db) {//create 'messages' collection
  if(err) {throw err;}
  
  const dbo = db.db("fcc-challenges-db");  
  dbo.createCollection('messages', function(err, result){
    if(err) {throw err;}    
    db.close();
  });
});


module.exports = function (app) {
  //I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.
  //(Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time), 
  //bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
  app.route('/api/threads/:board')
    .post(function (req, res) {
      var board = req.body.board;
      var new_thread = {
        text: req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: req.body.delete_password,
        replies: []
      };console.log(new_thread.board);
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) {throw err;}

        const dbo = db.db("fcc-challenges-db");  
        dbo.collection(board).insertOne(new_thread, function(err, result){
          if(err) {throw err;}    
          
          console.log("thread inserted, redirecting");
          res.redirect('/b/' + board + '/');
          db.close();
        });
      });
    
    })
  .get(function (req,res) {
    //I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies 
    //from /api/threads/{board}. The reported and delete_passwords fields will not be sent. 
    var board = req.params.board;
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) {throw err;}

      const dbo = db.db("fcc-challenges-db"); 
      dbo.collection(board).find({}, {delete_password: 0, reported: 0}).limit(10).sort({bumped_on: -1})
        .toArray(function(err, result) {
          if(err) {throw err;}    
          
          result.forEach(function(thread) {
            if(thread.replies.length > 3) {
              thread.replies = thread.replies.slice(-3);
            }
          });
          res.json(result);console.log(result);
          db.close();
      });
    });
  })
  .delete(function (req,res) {
  //I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. 
  //(Text response will be 'incorrect password' or 'success')
    var board = req.params.board;
    var thread_id = req.body.thread_id;
    var password = req.body.delete_password;

    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) {throw err;}

      const dbo = db.db("fcc-challenges-db"); 
      dbo.collection(board).findAndModify({_id: ObjectId(thread_id), delete_password: password}, [], {}, {remove: true, new: false}, function(err, result) {
          if(err) {throw err;}    
          console.log(result);
          if (result.value == null) {res.send("incorrect password");}
          else {res.send("success");}
          db.close();
      });
    });
  })
  //I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the thread_id. (Text response will be 'success')
  .put(function (req, res) {
    var board = req.params.board;
    var thread_id = req.body.thread_id;
    
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) {throw err;}

      const dbo = db.db("fcc-challenges-db");  
      dbo.collection(board).findOneAndUpdate({_id: ObjectId(thread_id)}, {$set: {reported: true}}, function(err, result) {
        if(err) {throw err;}    
        console.log(result);
        res.send("success");
        db.close();
      });
    });
  });
  
  app.route('/api/replies/:board')
  //I can POST a reply to a thread on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} 
  //and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) 
  //In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
    .post(function (req, res){

      var board = req.params.board;
      var thread_id = req.body.thread_id;
      var new_reply = {
        _id: new ObjectId(),
        text: req.body.text,
        created_on: new Date(),
        delete_password: req.body.delete_password,
        reported: false
      };
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) {throw err;}

        const dbo = db.db("fcc-challenges-db");  
        dbo.collection(board)
          .findOneAndUpdate({_id: ObjectId(thread_id)}, {$set: {bumped_on: new Date()}, $push: {replies: new_reply}}, 
            function(err, result){
              if(err) {throw err;}    
          
              console.log("reply inserted, redirecting");
              db.close();
        });
      });
      res.redirect('/b/' + board + '/' + thread_id);
    })
    .get(function (req,res) {
      //I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields. 
      var board = req.params.board;
      var thread_id = req.query.thread_id; console.log(thread_id);
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) {throw err;}

        const dbo = db.db("fcc-challenges-db"); 
        dbo.collection(board).find({_id: ObjectId(thread_id)}, {delete_password: 0, reported: 0}).sort({bumped_on: -1})
          .toArray(function(err, result) {
            if(err) {throw err;}

            res.json(result[0]);console.log(result);
            db.close();
        });
      });
  })
  //I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along 
  //the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')
  .delete(function (req,res) {
    var board = req.params.board;
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;
    var password = req.body.delete_password;

    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) {throw err;}

      const dbo = db.db("fcc-challenges-db"); // db.students.updateOne({ _id: 1, grades: 80 },{ $set: { "grades.$" : 82 } })
      dbo.collection(board)
        .findAndModify({_id: ObjectId(thread_id), replies: {$elemMatch: {_id: ObjectId(reply_id), delete_password: password}}}, [], 
          {$set: {"replies.$.text": '[deleted]'}}, function(err, result) {
            if(err) {throw err;}    
            console.log(result);
            if (result.value == null) {res.send("incorrect password");}
            else {res.send("success");}
            db.close();
          });
      });
  })
  //I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')
  .put(function (req, res) {
    var board = req.params.board;
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;
    
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) {throw err;}

      const dbo = db.db("fcc-challenges-db");  
      dbo.collection(board)
        .findOneAndUpdate({_id: ObjectId(thread_id), replies: {$elemMatch: {_id: ObjectId(reply_id)}}}, {$set: {"replies.$.reported": true}}, function(err, result) {
          if(err) {throw err;}    
          console.log(result);
          res.send("success");
          db.close();
      });
    });
  });

};
