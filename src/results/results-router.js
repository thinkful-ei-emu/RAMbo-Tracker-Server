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
        userSymptom.type_id
      );

      for (let j = 0; j < symptomInstances.length; j++) {
        let symptomInstance = symptomInstances[j];
        let meals = await ResultsService.getMealsWithinSymptomThreshold(
          db,
          user.id,
          symptomInstance.created,
          userSymptom.min_time,
          userSymptom.max_time
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
      })

      let mostCommonIngredients = ingredientsArr.slice(0, 14);
      let mostCommonFoods = foodArr.slice(0, 14);
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
        totalFoodsFound: foodArr.length,
        totalIngredientsFound: ingredientsArr.length
      };
      const necessaryTimeFields=['hours','days','minutes'];
      necessaryTimeFields.forEach(field=>{
        if(!myResult.symptomType.min_time[field]){
          myResult.symptomType.min_time[field]=0;
        }
        if(!myResult.symptomType.max_time[field]){
          myResult.symptomType.max_time[field]=0;
        }
      })
      results.push(myResult);
    
    }
    results.sort((a,b)=>{
      if(a.symptomType.type>b.symptomType.type){
        return 1
      }
      else if(a.symptomType.type<b.symptomType.type){
        return -1
      }
      else{
        return 0
      }
    })
    res.status(200).json(results);
    next();
  } catch (error) {
    res.status(404).json({ message: 'server error' });
    next(error);
  }
});

module.exports = ResultsRouter;
