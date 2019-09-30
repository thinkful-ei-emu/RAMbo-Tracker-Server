const xss = require('xss');

function serializeObjectArr(objArr){
  let response = [];
  for (let i = 0 ; i < objArr.length; i++){
    let myObj = {};
    let entries = Object.entries(objArr[i]);
    for (let k = 0 ; k < entries.length; k ++){
      myObj[entries[k][0]] = xss(entries[k][1]);
    }
    response.push(myObj);
  }
  return response;
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