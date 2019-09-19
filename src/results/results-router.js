const express = require('express');
const ResultsRouter = express.Router();
const ResultsService = require('./results-service.js');
const { requireAuth } = require('../middleware/jwt-auth');

ResultsRouter.use(requireAuth).get('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const user = req.user;
    let results = [];
    let foodArray = [];
    let foodAndSymptoms = await ResultsService.getUserSymptomTypes(db, user.id);
    console.log(foodAndSymptoms);
    foodAndSymptoms = await foodAndSymptoms.map((userSymptom, index) => {
      return ResultsService.getSymptomsByType(
        db,
        user.id,
        userSymptom.type
      )
      .then(symptomInstance => {
        return symptomInstance
      })
      .then(symptomInstance => {
        return {
          ...userSymptom,
          instances: symptomInstance 
        }
      })
    });

    console.log(foodAndSymptoms);
    // //[{"bloating": {}}, ]
    // foodAndSymptoms.instances = await foodAndSymptoms.map(async (symptomInstance, index) => {
    //     let meals = await ResultsService.getMealsWithinSymptomThreshold(
    //       db,
    //       user.id,
    //       symptomInstance[index].created
    //     );
    //     return {
    //       ...symptomInstance,
    //       meals
    //     }
    //   });
    //   foodAndSymptoms = foodAndSymptoms.map(async (meal, index) => {
    //       let foodIds = await ResultsService.getMealFoods(db, meal.id);
    //       return {
    //         ...foodAndSymptoms,
    //         foodIds
    //       }
    //       const frequencyIterator = Math.ceil(symptomInstance.severity_id / 2);
    //       foodIds.forEach((foodId, index) => {
    //         if (!doesArrayObjectIncludeFoodId(foodArray, foodId.food)) {
    //           foodArray.push({
    //             foodId: foodId.food,
    //             frequency: frequencyIterator
    //           });
    //         } else {
    //           const index = findIndexWithFoodId(foodArray, foodId.food);
    //           foodArray[index].frequency += frequencyIterator;
    //         }
    //       });
    //     });
    //   });

    //   let ingredientArray = [];
    //   foodArray.forEach(async (food) => {
    //     for (i = 0; i < food.frequency; i++) {
    //       let ingredients = await ResultsService.getIngredientsByFood(
    //         db,
    //         food.foodId
    //       );
    //       ingredients.forEach((ingredient) => {
    //         if (
    //           !doesArrayObjectIncludeIngredientId(
    //             ingredientArray,
    //             ingredient.id
    //           )
    //         ) {
    //           ingredientArray.push({ ingredient, frequency: 1 });
    //         } else {
    //           const index = findIndexWithIngredientId(
    //             ingredientArray,
    //             ingredient.id
    //           );
    //           ingredientArray[index].frequency += 1;
    //         }
    //       });
    //     }
    //   });
    //   ingredientArray = ingredientArray.sort((a, b) => {
    //     return a.frequency - b.frequency;
    //   });
    //   foodArray = foodArray.sort((a, b) => {
    //     return a.frequency - b.frequency;
    //   });
    //   let mostCommonIngredients = ingredientArray.slice(0, 6);
    //   let mostCommonFoodsIdsAndFrequencies = foodArray.slice(0, 6);
    //   let mostCommonFoods = [];
    //   mostCommonFoodsIdsAndFrequencies.forEach(
    //     async (foodsIdsAndFrequencies) => {
    //       let food = await ResultsService.getAFood(
    //         db,
    //         foodsIdsAndFrequencies.foodId
    //       );
    //       mostCommonFoods.push({
    //         name: food.name,
    //         frequency: foodsIdsAndFrequencies.frequency
    //       });
    //     }
    //   );
    //   let myResult = {
    //     symptomType: userSymptom,
    //     mostCommonFoods,
    //     mostCommonIngredients
    //   };
    //   results.push(myResult);
    // });

    res.status(200);
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
