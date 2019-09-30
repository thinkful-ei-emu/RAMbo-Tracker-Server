const knex = require('knex');

const ResultsService = {
  async getUserSymptomTypes(db, user_id){
    return db('user_symptom').select('type', 'id AS type_id').where({user_id})
  },
  
  async getSymptomsByType(db, type_id){
    return db('symptoms').where({type_id})
  },

  async getMealsWithinSymptomThreshold(db, user_id, timecode){
    return db('meals')
    .select('*')
    .from('meals')
    .where({user_id})
    .then(userMeals => {
      return userMeals.filter(meal => {
        const mealDate = new Date(meal.created);
        const timecodeDate = new Date(timecode);
        // 1000 = 1sec , 60000 = 1 minute , 3600000 = 1 hr
        if((timecodeDate.getTime() - mealDate.getTime()) < (1000*60*60*6) && timecodeDate.getTime() - mealDate.getTime() > 1000 * 60 ){
          return true;
        }
        else{
          return false;
        }
      });
    })


    
  },

  async getMealFoods(db, meal){
    return db('plates').select('food').where({meal})
  },

  async getAFood(db, ndbno){
    return db('food').where({ndbno})
  },
  async getIngredientsByFood(db,ndbno){
    return db.select('*').from('ingredients').where({food : ndbno});
  }
}

module.exports = ResultsService;