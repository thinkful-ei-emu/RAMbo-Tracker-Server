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
      let foodArray = [];

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
            console.log(foodArray);
            let foodId = foodIds[l];
            if (!doesArrayObjectIncludeFoodId(foodArray, foodId.food)) {
              foodArray.push({
                foodId: foodId.food,
                frequency: frequencyIterator
              });
            } else {
              const index = findIndexWithFoodId(foodArray, foodId.food);
              foodArray[index].frequency += frequencyIterator;
            }
          }
        }
      }
      console.log(foodArray);
      let ingredientArray = [];
      for (let i = 0; i < foodArray.length; i++) {
        console.log('foodArray index', i);
        let food = foodArray[i];
        for (j = 0; j < food.frequency; j++) {
          console.log(`${j}th iteration over ${food.foodId}`);
          let ingredients = await ResultsService.getIngredientsByFood(
            db,
            food.foodId.toString()
          );

          for (let k = 0; k < ingredients.length; k++) {
            console.log('ingredientsArray index', k);
            let ingredient = ingredients[k];
            if (
              !doesArrayObjectIncludeIngredientName(
                ingredientArray,
                ingredient.name
              )
            ) {
              ingredientArray.push({ ingredient, frequency: 1 });
            } else {
              const index = findIndexWithIngredientName(
                ingredientArray,
                ingredient.name
              );
              ingredientArray[index].frequency += 1;
            }
          }
        }
      }

      ingredientArray = ingredientArray.sort((a, b) => {
        return b.frequency - a.frequency;
      });
      foodArray = foodArray.sort((a, b) => {
        return b.frequency - a.frequency;
      });
      let mostCommonIngredients = ingredientArray.slice(0, 5);
      let mostCommonFoodsIdsAndFrequencies = foodArray.slice(0, 5);
      let mostCommonFoods = [];

      for (let i = 0; i < mostCommonFoodsIdsAndFrequencies.length; i++) {
        let foodsIdsAndFrequencies = mostCommonFoodsIdsAndFrequencies[i];
        let food = await ResultsService.getAFood(
          db,
          foodsIdsAndFrequencies.foodId
        );
        mostCommonFoods.push({
          name: food[0].name,
          frequency: foodsIdsAndFrequencies.frequency
        });
      }
      let myResult = {
        symptomType: userSymptom,
        mostCommonFoods,
        mostCommonIngredients
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

function doesArrayObjectIncludeFoodId(array, id) {
  let includes = false;
  array.forEach((item) => {
    if (item.foodId === id) {
      includes = true;
    }
  });
  return includes;
}

function findIndexWithFoodId(array, id) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].foodId === id) {
      return i;
    }
  }
}
function doesArrayObjectIncludeIngredientName(array, name) {
  let includes = false;
  array.forEach((item) => {
    if (item.ingredient.name === name) {
      includes = true;
    }
  });
  return includes;
}

function findIndexWithIngredientName(array, name) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].ingredient.name === name) {
      return i;
    }
  }
}

module.exports = ResultsRouter;
