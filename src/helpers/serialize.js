const xss = require('xss');

function serializeObjectArr(objArr){
  let responses = [];
  for (let i = 0 ; i < objArr.length; i++){
    let myObj = {};
    let entries = Object.entries(foods[i]);
    for (let k = 0 ; k < entries.length; k ++){
      myObj[entries[k][0]] = xss(entries[k][1]);
    }
    responses.push(myObj);
  }
  return responses;
}

function serializeObject(obj){
  let myObj = {};
  let entries = Object.entries(obj);
  for (let i = 0 ; i < entries.length; i++){
    myObj[entries[i][0]] = xss(entries[i][1]);
  }
  return myObj;
}

module.exports = {serializeObjectArr, serializeObject};