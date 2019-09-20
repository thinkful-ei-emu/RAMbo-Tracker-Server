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

      for (let i = 0; i < symptomInstances.length; i++) {
        let symptomInstance = symptomInstances[i];
        let meals = await ResultsService.getMealsWithinSymptomThreshold(
          db,
          user.id,
          symptomInstance.created
        );
        for (let i = 0; i < meals.length; i++) {
          let meal = meals[i];
          let foodIds = await ResultsService.getMealFoods(db, meal.id);
          const frequencyIterator = Math.ceil(symptomInstance.severity_id / 2);

          for (let i = 0; i < foodIds.length; i++) {
            let foodId = foodIds[i];
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

      let ingredientArray = [];
      for (let i = 0; i < foodArray.length; i++) {
        let food = foodArray[i];
        for (i = 0; i < food.frequency; i++) {
          let ingredients = await ResultsService.getIngredientsByFood(
            db,
            food.foodId.toString()
          );

          for (let i = 0; i < ingredients.length; i++) {
            let ingredient = ingredients[i];
            if (
              !doesArrayObjectIncludeIngredientId(
                ingredientArray,
                ingredient.id
              )
            ) {
              ingredientArray.push({ ingredient, frequency: 1 });
            } else {
              const index = findIndexWithIngredientId(
                ingredientArray,
                ingredient.id
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
function doesArrayObjectIncludeIngredientId(array, id) {
  let includes = false;
  array.forEach((item) => {
    if (item.ingredient.id === id) {
      includes = true;
    }
  });
  return includes;
}

function findIndexWithIngredientId(array, id) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].ingredient.id === id) {
      return i;
    }
  }
}

module.exports = ResultsRouter;