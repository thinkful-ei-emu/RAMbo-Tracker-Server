const parse = require('postgres-interval');

const ResultsService = {
  async getUserSymptomTypes(db, user_id){
    return db('user_symptom').select('type', 'id AS type_id', 'min_time', 'max_time').where({user_id})
  },
  
  async getSymptomsByType(db, type_id){
    return db('symptoms').where({type_id})
  },

  async getMealsWithinSymptomThreshold(db, user_id, timecode, min_time, max_time){
    min_time.days = min_time.days || 0;
    min_time.hours = min_time.hours || 0;
    min_time.minutes = min_time.minutes || 0;
    max_time.days = max_time.days || 0;
    max_time.hours = max_time.hours || 0;
    max_time.minutes = max_time.minutes || 0;
    min_time = min_time.minutes * 60000 + min_time.hours * 60000 * 60 + min_time.days * 60000 * 60 * 24;
    
    max_time = max_time.minutes * 60000 + max_time.hours * 60000 * 60 + max_time.days * 60000 * 60 * 24;
    return db('meals')
    .select('*')
    .from('meals')
    .where({user_id})
    .then(userMeals => {
      return userMeals.filter(meal => {
        const mealDate = new Date(meal.created);
        const timecodeDate = new Date(timecode);
        // 1000 = 1sec , 60000 = 1 minute , 3600000 = 1 hr
        if((timecodeDate.getTime() - mealDate.getTime()) < max_time && (timecodeDate.getTime() - mealDate.getTime()) > min_time ){
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