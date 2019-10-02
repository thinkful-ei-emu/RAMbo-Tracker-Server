const express = require('express');
const FoodRouter = express.Router();
require('dotenv').config();
const { USDA_API_KEY } = require('../config');
const jsonBodyParser = express.json();
const FoodService = require('./FoodService');
const rp = require('request-promise');
const { requireAuth } = require('../middleware/jwt-auth');


//when user searches for food item to add to meal
FoodRouter.use(requireAuth)
  .get('/search', jsonBodyParser, (req, res, next) => {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ error: 'need search query' });
    }
    const pageNumber = req.query.pageNumber || 1;
    rp(`https://api.nal.usda.gov/fdc/v1/search?api_key=${USDA_API_KEY}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(
        {
          'generalSearchInput': search,
          'requireAllWords': 'true',
          'includeDataTypes': { 'Survey (FNDDS)': false, 'Foundation': true, 'Branded': true, 'SR Legacy': true },
          'pageNumber': pageNumber
        }
      )
    })
      .then((body) => {
        return res.status(200).json(body);
      })
      .catch((err) => {
        return res.status(400).json(err);
      });
  })
  //when user wants to add food item to meal, adding ID (ITEM) to meal, search for reports for food item and use service to add ingredients
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { ndbno} = req.body;
    if(ndbno == null){
      return res.status(400).json({error:'Needs food id'})
    }
    const doesFoodExist = await FoodService.searchFood(
      req.app.get('db'),
      ndbno
    );
    if (doesFoodExist.length === 0) {
      rp(`https://api.nal.usda.gov/fdc/v1/${ndbno}?api_key=${USDA_API_KEY}`, {
        method: 'GET',
      })
        .then(async (body) => {
          body = JSON.parse(body);
          if(!(Object.keys(body).includes("description"))){
            throw new Error('The ID does not exist');
          }
          const food = await FoodService.addFood(req.app.get('db'), ndbno, body.description);
          return FoodService.addIngredients(req.app.get('db'), ndbno, body);
        })
        .then(() => {
          res.status(204).end();
          next();
        })
        .catch((error) => {
          return res.status(400).json(error);
        });
    } else {
      res.status(204).end();
      next();
    }
  });

module.exports = FoodRouter;

//searching food by query term
//  // https://api.nal.usda.gov/ndb/search/?format=xml&q=butter&max=25&offset=0&api_key=DEMO_KEY

//getting food by USDA ID NUMBER
//https://api.nal.usda.gov/ndb/V2/reports?ndbno=45166992&type=b&format=json&api_key=UagRUkxYwSoqkndlUZxctIfknr2Jolosk7p9O46g
