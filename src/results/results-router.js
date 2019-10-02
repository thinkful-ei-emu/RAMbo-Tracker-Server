const express = require('express');
const ResultsRouter = express.Router();
const ResultsService = require('./results-service.js');
const { requireAuth } = require('../middleware/jwt-auth');
const {serializeObjectArr} = require('../helpers/serialize.js')

ResultsRouter.use(requireAuth).get('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const user = req.user;
    let results = [];
    let foodObj = {};
    const userSymptoms = await ResultsService.getUserSymptomTypes(db, user.id);
    for (let i = 0; i < userSymptoms.length; i++) {
      let userSymptom = userSymptoms[i];

      let symptomInstances = await ResultsService.getSymptomsByType(
        db,
        user.id,
        userSymptom.type
      );

      for (let j = 0; j < symptomInstances.length; j++) {
        let symptomInstance = symptomInstances[j];
        let meals = await ResultsService.getMealsWithinSymptomThreshold(
          db,
          user.id,
          symptomInstance.created
        );

        for (let k = 0; k < meals.length; k++) {
          let meal = meals[k];
          let foodIds = await ResultsService.getMealFoods(db, meal.id); 
          const frequencyIterator = Math.ceil(symptomInstance.severity_id / 2);

          for (let l = 0; l < foodIds.length; l++) {
            let foodId = foodIds[l];
            if (!foodObj[foodId]) {
              foodObj[foodId.food] = frequencyIterator;
            } else {
              foodObj[foodId.food] =  foodObj[foodId.food] + frequencyIterator;
            }
          }
        }
      }
    
      let foodArr = Object.entries(foodObj);
      let ingredientsObj = {};
      for (let j = 0; j < foodArr.length; j++) {
        let food = foodArr[j][0];
        for (k = 0; k < foodArr[j][1]; k++) {
          let ingredients = await ResultsService.getIngredientsByFood(
            db,
            food.toString()
          );

          for (let l = 0; l < ingredients.length; l++) {
            let ingredient = ingredients[l];
            if (!ingredientsObj[ingredient.name]) {
              ingredientsObj[ingredient.name] = 1;
            } 
            else {
              ingredientsObj[ingredient.name] =  ingredientsObj[ingredient.name] + 1;
            }
          }
        }
      }
      let totalFoodsWeight = 0;
      for(let z = 0 ; z < foodArr.length; z++){
        totalFoodsWeight += foodArr[z][1];
      }
      
      let ingredientsArr = Object.entries(ingredientsObj)
      let totalIngredientsWeight = 0;
      for(let z = 0 ; z < ingredientsArr.length; z++){
        totalIngredientsWeight += ingredientsArr[z][1];
      }

      ingredientsArr = ingredientsArr.sort((a, b) => {
        return b[1] - a[1];
      });

      foodArr = foodArr.sort((a, b) => {
        return b[1] - a[1];
      });

      let mostCommonIngredients = ingredientsArr.slice(0, 5);
      let mostCommonFoods = foodArr.slice(0, 5);
      let mostCommonFoodsNames = [];
      let mostCommonIngredientsNames = []; 

      for (let j = 0; j < mostCommonFoods.length; j++) {    
        let food = await ResultsService.getAFood(
          db,
          mostCommonFoods[j][0]
        );

        mostCommonFoodsNames.push({
          name: food[0].name,
          weight:  mostCommonFoods[j][1]
        });
      }
    
      for (let j = 0; j < mostCommonIngredients.length; j++) {    
        mostCommonIngredientsNames.push({
          name: mostCommonIngredients[j][0],
          weight:  mostCommonIngredients[j][1]
        });
      }

      let myResult = {
        symptomType: userSymptom,
        mostCommonFoods : mostCommonFoodsNames,
        mostCommonIngredients : mostCommonIngredientsNames,
        totalFoodsWeight,
        totalIngredientsWeight
      };
      results.push(myResult);
    
    }
    
    let serializedResults = serializeObjectArr(results);
    console.log(serializedResults);
    res.status(200).json(serializedResults);
    next();
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'server error' });
    next(error);
  }
});

module.exports = ResultsRouter;
