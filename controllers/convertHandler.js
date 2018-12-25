/*
*
*
*       Complete the handler logic below
*       
*       
*/

function ConvertHandler() {
    
  this.getNum = function(input) {
    var result;
    var number = input.slice(0, input.search(/[a-zA-Z]/));
    if (number == '') {return 1;}
    if (/^[+-]?([0-9]*[.])?[0-9]+(\/([0-9]*[.])?[0-9]+)?/.test(number)) { //test if a valid number 
      
      if (number.indexOf('/')>0) { //if fractions
        var numberArr = number.split('/');
        
        if (numberArr.length !=2) { //if more than one /-fraction signs
          return 'invalid number';
        }
        else {
          result = parseFloat(numberArr[0]) / parseFloat(numberArr[1]);
        }
      }
      else {
        result = parseFloat(number); //convert to return value to float for conformity
      }
      return result;
    } else {
      return 'invalid number';
    }
  }
    
  
  this.getUnit = function(input) {
    return input.slice(input.search(/[a-zA-Z]/));
  };
  
  this.getReturnUnit = function(initUnit) {

    if (initUnit == 'gal') {return 'L';}
    if (initUnit == 'L') {return 'gal';}
    if (initUnit == 'lbs') {return 'kg';}
    if (initUnit == 'kg') {return 'lbs';}
    if (initUnit == 'mi') {return 'km';}
    if (initUnit == 'km') {return 'mi';}    
    return 'invalid unit';
    
  };

  this.spellOutUnit = function(unit) {

    if (unit == 'gal') {return 'galons';}
    if (unit == 'L') {return 'liters';}
    if (unit == 'lbs') {return 'pounds';}
    if (unit == 'kg') {return 'kilograms';}
    if (unit == 'mi') {return 'miles';}
    if (unit == 'km') {return 'kilometers';}
    else {return 'invalid unit';}
  };
  
  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934; // 
    var result;
    
    if(Number.isFinite(initNum)) {
      if (initUnit == 'gal') {result = initNum * galToL;}
      else if (initUnit == 'L') {result = initNum / galToL;}
      else if (initUnit == 'lbs') {result = initNum * lbsToKg;}
      else if (initUnit == 'kg') {result = initNum / lbsToKg;}
      else if (initUnit == 'mi') {result = initNum * miToKm;}
      else if (initUnit == 'km') {result = initNum / miToKm;}
      else {return 'invalid input';}

      return Math.round(result * 100000.00)/100000.00;
    }
    return 'invalid number';
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) { 
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
  
};

module.exports = ConvertHandler;
