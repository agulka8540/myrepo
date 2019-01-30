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
var request = require('request');
var requestIp = require('request-ip');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
MongoClient.connect(CONNECTION_STRING, function(err, db) {//create 'stocks' collection
  if(err) {throw err;}
  
  const dbo = db.db("fcc-challenges-db");  
  dbo.createCollection('stocks', function(err, result){
    if(err) {throw err;}    
    console.log("Collection created!");
    db.close();
  });
});


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query.stock;
      var IPaddress = requestIp.getClientIp(req); console.log("my IP is " + IPaddress);
    
      if(!Array.isArray(stock)) {//if only 1 stock symbol submitted and get parameter is not array
        stock = [stock];} //it should be transformed into array for consistency
      
      var stockDataObject = {};
      var responseCounter = 0;
      // Convert all stock symbols to upper case. 
      stock = stock.map(function(symb){
        return symb.toUpperCase();
      });
                
      stock.forEach(function(stockSymbol) {
        stockDataObject[stockSymbol] = {stock: stockSymbol, price: -1, likes: -1};
      });
      console.log(stock);
    
      stock.forEach(function(stockSymbol) {
        var url = `https://api.iextrading.com/1.0/stock/${stockSymbol}/price`;//stock price api, returns a number

        request(url, function (error, response, body) {
            stockDataObject[stockSymbol].price = body;
            ++responseCounter;
            checkComplete(stockDataObject);
          });
       
        if (req.query.like === "true") {//if "like" checkbox selected 
          MongoClient.connect(CONNECTION_STRING, function(err,db) { //insert this info into the database
            if(err) {throw err;}
            
            const dbo = db.db("fcc-challenges-db"); 
            //database query searching for stock symbol, inserting IP address and creating new entry if doesn't exist already (upsert)
            dbo.collection('stocks').findOneAndUpdate({stock: stockSymbol}, {$addToSet: {likes: IPaddress}}, {upsert: true},  function (err, result) {
              if(err) {throw err;}                

              console.log("like for " + stockSymbol +" updated");
              db.close();
            });                 
          });                  
        }
        MongoClient.connect(CONNECTION_STRING, function(err,db) { //if "like" is not selected, query the number of likes 
          if(err) {throw err;}

          const dbo = db.db("fcc-challenges-db");
          dbo.collection('stocks').findOne({stock: stockSymbol}, function (err, result) {
            if(err) {throw err;}
            
            //if stock is not in the database and null is returned, likes need to be 0, otherwise error
            var likes; 
            if(result == null) {likes = 0;}
            else {likes = result.likes.length;}
            
            stockDataObject[stockSymbol].likes = likes;
            ++responseCounter;
            checkComplete(stockDataObject);
            db.close();
          });                 
        });  
        function checkComplete(stockDataObject) {
          if(responseCounter == 2 * stock.length) {
            console.log(stockDataObject);
            //If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes, 
            //it will display rel_likes(the difference between the likes on both) on both
            if(stock.length == 2) {
              stockDataObject[ stock[0] ].rel_likes = stockDataObject[ stock[1] ].likes - stockDataObject[ stock[0] ].likes;
              stockDataObject[ stock[1] ].rel_likes = stockDataObject[ stock[0] ].likes - stockDataObject[ stock[1] ].likes;
              delete stockDataObject[ stock[0] ].likes;
              delete stockDataObject[ stock[1] ].likes;
            }
            res.json({stockData: stockDataObject});
          }
        }  
      });
  });
};