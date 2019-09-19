const knex = require('knex');

const ResultsService = {
  getUserSymptomTypes(db, user_id){
    return db('symptoms').distinct('type').where({user_id})
  },
  
  getSymptomsByType(db, user_id, type){
    return db('symptoms').select('*').from('meals').where({user_id, type})
  },

  getMealsWithinSymptomThreshold(db, user_id, timecode){
    console.log('timecode', timecode);
    return db('meals')
    .select('*')
    .from('meals')
    .where({user_id})
    // .andWhere(knex.raw(':created: BETWEEN :timecode - INTERVAL :fourhours AND timecode - INTERVAL :thirtyminutes', {
    //   created: 'meals.created',
    //   timecode,
    //   fourhours: '4 hours',
    //   thirtyminutes: '30 minutes'
    // }));
  },

  getMealFoods(db, meal){
    return db('plates').select('food').where({meal})
  },

  getAFood(db, ndbno){
    return db('food').where({ndbno})
  },
  getIngredientsByFood(db,ndbno){
    return db('ingredients').where({food : ndbno});
  }
}

module.exports = ResultsService;