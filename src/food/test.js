const rp = require('request-promise');
require('dotenv').config();
const { USDA_API_KEY } = require('../config');
/* rp(`https://api.nal.usda.gov/fdc/v1/search?api_key=${USDA_API_KEY}`,{
  method:'POST',
  headers:{
    'content-type': 'application/json'
  },
  body:JSON.stringify(
    {
      'generalSearchInput':'lay\'s chips',
      'requireAllWords':'true',
      'includeDataTypes':{'Survey (FNDDS)':false,'Foundation':true,'Branded':true,'SR Legacy':true}
    }
  )
})
  .then(res=>{
    console.log(res);
  }); */

rp(`https://api.nal.usda.gov/fdc/v1/503579?api_key=${USDA_API_KEY}`,{
  method:'GET',
})
  .then(res=>{
    console.log(res);
    console.log(typeof res);
  });