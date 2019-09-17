const express = require("express");
const FoodRouter = express.Router();
require("dotenv").config();
const { USDA_API_KEY } = require("../config");

const jsonBodyParser = express.json();
//const path = require('path')
//const FoodService = require("./FoodService");
const rp = require("request-promise");

//when user searches for food item to add to meal
FoodRouter
.get("/search/:search", jsonBodyParser, (req, res, next) => {
  const search = req.params.search;
  if (!search) {
    res.send(400).json({ error: "Missing 'term' in request body" });
  }
  rp(
    `https://api.nal.usda.gov/ndb/search/?format=xml&sort=r&q=${search}&max=25&offset=0&api_key=${USDA_API_KEY}`
  )
    .then(body => {
      return res.status(201).json(body);
    })
    .catch(err => {
      return res.status(400).json(err);
    });
})
//when user wants to add food item to meal, adding ID (ITEM) to meal, search for reports for food item and use service to add ingredients
.post("/", jsonBodyParser, async (req, res) => {
  const { item, name } = req.body;
  //const food = await service.addFood(req.app.get('db'), item, name)
  rp(
    `https://api.nal.usda.gov/ndb/V2/reports?ndbno=${item}&type=b&format=json&api_key=${USDA_API_KEY}`
  )
    .then(body => {
      console.log("BODY", body);
      //service.addIngredient(req.app.get('db), item)
    })

    .then(()=> {
      return res.status(204);
    });
});

module.exports = FoodRouter;

//searching food by query term
//  // https://api.nal.usda.gov/ndb/search/?format=xml&q=butter&max=25&offset=0&api_key=DEMO_KEY

//getting food by USDA ID NUMBER
//https://api.nal.usda.gov/ndb/V2/reports?ndbno=45166992&type=b&format=json&api_key=UagRUkxYwSoqkndlUZxctIfknr2Jolosk7p9O46g
