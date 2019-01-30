/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/

var chai = require('chai');
var assert = chai.assert;
var ConvertHandler = require('../controllers/convertHandler.js');

var convertHandler = new ConvertHandler();

suite('Unit Tests', function(){
  
  suite('Function convertHandler.getNum(input)', function() {
    
    test('Whole number input', function(done) {
      var input = '32L';
      assert.equal(convertHandler.getNum(input),32);
      done();
    });
    
    test('Decimal Input', function(done) {
      let input = '1.3mi';
      let result = convertHandler.getNum(input);
      assert.equal(result, 1.3);
      done();
    });
    
    test('Fractional Input', function(done) {
      let input = '1/4kg';
      let result = convertHandler.getNum(input);
      assert.equal(result, 0.25);
      done();
    });
    
    test('Fractional Input w/ Decimal', function(done) {
      let input = '5/6.5lbs';
      let result = convertHandler.getNum(input);
      assert.equal(result, 0.76923);
      done();
    });
    
    test('Invalid Input (double fraction)', function(done) {
      let input = '5/2/3km';
      let result = convertHandler.getNum(input);
      assert.equal(result, 'invalid number');
      done();
    });
    
    test('No Numerical Input', function(done) {
      let input = 'km';
      let result = convertHandler.getNum(input);
      assert.equal(result, 1);
      done();
    }); 
    
  });
  
  suite('Function convertHandler.getUnit(input)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      var input = ['gal','l','mi','km','lbs','kg','GAL','L','MI','KM','LBS','KG'];
      input.forEach(function(ele) {
        //assert
      });
      done();
    });
    
    test('Unknown Unit Input', function(done) {
      let input = '10BLA';
      let result = convertHandler.getUnit(input);
      assert.equal(result, 'invalid unit');
      done();
    });  
    
  });
  
  suite('Function convertHandler.getReturnUnit(initUnit)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      var input = ['gal','l','mi','km','lbs','kg'];
      var expect = ['l','gal','km','mi','kg','lbs'];
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.getReturnUnit(ele), expect[i]);
      });
      done();
    });
    
  });  
  
  suite('Function convertHandler.spellOutUnit(unit)', function() {
    
    test('For Each Valid Unit Inputs', function(done) {
      let input = ['gal','L','mi','km','lbs','kg'];
      let expected = ['galons','liters','miles','kilometers','pounds','kilograms'];
      input.forEach(function(ele, i) {
        let result = convertHandler.spellOutUnit(ele);
        assert.equal(result, expected[i]);
      });
      done();
    });
    
  });
  
  suite('Function convertHandler.convert(num, unit)', function() {
    
    test('Gal to L', function(done) {
      var input = [5, 'gal'];
      var expected = 18.9271;
      assert.approximately(convertHandler.convert(input[0],input[1]),expected,0.1); 
      done();
    });
    
    test('L to Gal', function(done) {
      let input = [10, 'L'];
      let expected = 2.64172;
      let result = convertHandler.convert(input[0], input[1]);
      assert.approximately(result, expected, 0.1); 
      done();
    });
    
    test('Mi to Km', function(done) {
      let input = [5, 'mi'];
      let expected = 8.0467;
      let result = convertHandler.convert(input[0], input[1]);
      assert.approximately(result, expected, 0.1); 
      done();
    });
    
    test('Km to Mi', function(done) {
      let input = [10, 'km'];
      let expected = 6.21373;
      let result = convertHandler.convert(input[0], input[1]);
      assert.approximately(result, expected, 0.1); 
      done();
    });
    
    test('Lbs to Kg', function(done) {
      let input = [2, 'lbs'];
      let expected =  0.90718;
      let result = convertHandler.convert(input[0], input[1]);
      assert.approximately(result, expected, 0.1); 
      done();
    });
    
    test('Kg to Lbs', function(done) {
      let input = [4, 'kg'];
      let expected =  8.8185;
      let result = convertHandler.convert(input[0], input[1]);
      assert.approximately(result, expected, 0.1); 
      done();
    });
    
  });

});