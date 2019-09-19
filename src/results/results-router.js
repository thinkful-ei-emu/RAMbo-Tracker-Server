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
    console.log('userSymptoms', userSymptoms);
    userSymptoms.forEach(async (userSymptom, index) => {
      console.log('userSymptoms index', index);
      let foodArray = [];
      partOne = async () =>{
        let symptomInstances = await ResultsService.getSymptomsByType(
          db,
          user.id,
          userSymptom.type
        );
        symptomInstances.forEach(async (symptomInstance, index) => {
          console.log('symptomInstances index', index);
          let meals = await ResultsService.getMealsWithinSymptomThreshold(
            db,
            user.id,
            symptomInstance.created
          );
          console.log('meals', meals);
          meals.forEach(async (meal, index) => {
            console.log('meals index', index);
            let foodIds = await ResultsService.getMealFoods(db, meal.id);
            const frequencyIterator = Math.ceil(symptomInstance.severity_id / 2);
            foodIds.forEach((foodId, index) => {
              console.log('foodIds index', index);
              if (!doesArrayObjectIncludeFoodId(foodArray, foodId.food)) {
                foodArray.push({
                  foodId: foodId.food,
                  frequency: frequencyIterator
                });
              } else {
                const index = findIndexWithFoodId(foodArray, foodId.food);
                foodArray[index].frequency += frequencyIterator;
              }
            });
          });
        });
      }
      partTwo = async()=> {
        console.log('foodArray', foodArray);
        let ingredientArray = [];
        foodArray.forEach(async (food) => {
        for (i = 0; i < food.frequency; i++) {
          let ingredients = await ResultsService.getIngredientsByFood(
            db,
            food.foodId
          );
          ingredients.forEach((ingredient) => {
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
          });
        }
      });
      ingredientArray = ingredientArray.sort((a, b) => {
        return a.frequency - b.frequency;
      });
      foodArray = foodArray.sort((a, b) => {
        return a.frequency - b.frequency;
      });
      let mostCommonIngredients = ingredientArray.slice(0, 6);
      let mostCommonFoodsIdsAndFrequencies = foodArray.slice(0, 6);
      let mostCommonFoods = [];
      mostCommonFoodsIdsAndFrequencies.forEach(
        async (foodsIdsAndFrequencies) => {
          let food = await ResultsService.getAFood(
            db,
            foodsIdsAndFrequencies.foodId
          );
          mostCommonFoods.push({
            name: food.name,
            frequency: foodsIdsAndFrequencies.frequency
          });
        }
      );
      let myResult = {
        symptomType: userSymptom,
        mostCommonFoods,
        mostCommonIngredients
      };
      results.push(myResult);
      console.log(myResult);
      }
      await partOne();
      await partTwo();
    });

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
    if (array[i].ingredient.Id === id) {
      return i;
    }
  }
}

module.exports = ResultsRouter;
