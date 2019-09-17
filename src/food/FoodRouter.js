const express = require("express");
const FoodRouter = express.Router();
require('dotenv').config();
const {USDA_API_KEY} = require('../config');

//const jsonBodyParser = express.json()
//const path = require('path')
//const FoodService = require("./FoodService");
const rp = require('request-promise');


FoodRouter
.get("/search", (req, res, next) => {
  console.log(USDA_API_KEY)
  rp(
    `https://api.nal.usda.gov/ndb/search/?format=xml&sort=r&q=butter&max=25&offset=0&api_key=${USDA_API_KEY}`
  ).then(body => {
    return res.status(201).json(body);
})
.catch(err => {
    return res.status(400).json(err);
 
});
});

module.exports = FoodRouter;
//searching food by query term
//  // https://api.nal.usda.gov/ndb/search/?format=xml&q=butter&max=25&offset=0&api_key=DEMO_KEY

//getting food by USDA ID NUMBER
//https://api.nal.usda.gov/ndb/V2/reports?ndbno=45166992&type=b&format=json&api_key=UagRUkxYwSoqkndlUZxctIfknr2Jolosk7p9O46g
