const xss = require('xss');

function serializeObjectArr(objArr){
  let response = [];
  for (let i = 0 ; i < objArr.length; i++){
    let myObj = {};
    let entries = Object.entries(objArr[i]);
    for (let k = 0 ; k < entries.length; k ++){
      if(typeof entries[k][1] === string){
        myObj[entries[k][0]] = xss(entries[k][1]);
      }
      else {
        myObj[entries[k][0]] = entries[k][1];
      }
    }
    response.push(myObj);
  }
  return response;
}

function serializeObject(obj){
  let myObj = {};
  let entries = Object.entries(obj);
  for (let i = 0 ; i < entries.length; i++){
    if(typeof entries[k][1] === string){
      myObj[entries[i][0]] = xss(entries[i][1]);
    }
    else {
      myObj[entries[i][0]] = entries[i][1];
    }
  }
  return myObj;
}

module.exports = {serializeObjectArr, serializeObject};