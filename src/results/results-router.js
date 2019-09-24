const express = require('express');
const ResultsRouter = express.Router();
const ResultsService = require('./results-service.js');
const { requireAuth } = require('../middleware/jwt-auth');

ResultsRouter.use(requireAuth).get('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const user = req.user;
    let results = [];
    const userSymptoms = await ResultsService.getUserSymptomTypes(db, user.id);
    for (let i = 0; i < userSymptoms.length; i++) {
      let userSymptom = userSymptoms[i];
      let foodObj = {};

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
        console.log('meals', meals);
        for (let k = 0; k < meals.length; k++) {
          let meal = meals[k];
          let foodIds = await ResultsService.getMealFoods(db, meal.id); 
          console.log('foodIds', foodIds);
          const frequencyIterator = Math.ceil(symptomInstance.severity_id / 2);

          for (let l = 0; l < foodIds.length; l++) {
            console.log(foodObj);
            let foodId = foodIds[l];
            if (!foodObj[foodId]) {
              foodObj[foodId.food] = frequencyIterator;
            } else {
              foodObj[foodId.food] =  foodObj[foodId.food] + frequencyIterator;
            }
          }
        }
      }
      console.log(foodObj);
      let foodArr = Object.entries(foodObj);
      let ingredientsObj = {};
      for (let i = 0; i < foodArr.length; i++) {
        console.log('foodObj index', i);
        let food = foodArr[i][0];
        for (j = 0; j < foodArr[i][1]; j++) {
          console.log(`${j}th iteration over ${food.foodId}`);
          let ingredients = await ResultsService.getIngredientsByFood(
            db,
            foodArr[i][0].toString()
          );

          for (let k = 0; k < ingredients.length; k++) {
            console.log('ingredientsObj index', k);
            let ingredient = ingredients[k];
            if (ingredientsObj[ingredient.name]) {
              ingredientsObj[ingredient.name] = 1;
            } 
            else {
              ingredientsObj[ingredient.name] =  ingredientsObj[ingredient.name] + 1;
            }
          }
        }
      }
      
      let ingredientsArr = Object.entries(ingredientObj)
      ingredientsArr = ingredientObj.sort((a, b) => {
        return b[1] - b[1];
      });
      foodArr = foodArr.sort((a, b) => {
        return b[1] - a[1];
      });
      let mostCommonIngredients = ingredientObj.slice(0, 5);
      let mostCommonFoods = foodArr.slice(0, 5);
      let mostCommonFoodsNames = [];
      let mostCommonIngredientsNames = []; 

      for (let i = 0; i < mostCommonFoods; i++) {    
        let food = await ResultsService.getAFood(
          db,
          mostCommonFoods[i][0]
        );
        mostCommonFoodsNames.push({
          name: food[0].name,
          frequency:  mostCommonFoods[i][1]
        });
      }
      for (let i = 0; i < mostCommonIngredients; i++) {    
        mostCommonIngredientsNames.push({
          name: food[i][0],
          frequency:  mostCommonIngredients[i][1]
        });
      }
      let myResult = {
        symptomType: userSymptom,
        mostCommonFoods : mostCommonFoodsNames,
        mostCommonIngredients : mostCommonIngredientsNames
      };
      results.push(myResult);
    }

    res.status(200).json(results);
    next();
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'server error' });
    next(error);
  }
});

module.exports = ResultsRouter;
