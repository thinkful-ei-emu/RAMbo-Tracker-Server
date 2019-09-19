const ResultsService = {
  getUserSymptomTypes(db, user_id){
    db('symptoms').distinct('type').where({user_id})
  },
  
  getSymptomsByType(db, user_id, type){
    db('symptoms').where({user_id, type})
  },

  getMealsWithinSymptomThreshold(db, user_id, timecode){
    db('meals')
    .select('*')
    .from('meals')
    .where({user_id})
    .and(knex.raw(':created: BETWEEN :timecode - INTERVAL :fourhours AND timecode - INTERVAL :thirtyminutes', {
      created: 'meals.created',
      timecode,
      fourhours: '4 hours',
      thirtyminutes: '30 minutes'
    }));
  },

  getMealFoods(db, meal){
    db('plates').select('food').where({meal})
  },

  getAFood(db, ndbno){
    db('food').where({ndbno})
  },
  getIngredientsByFood(db,ndbno){
    db('ingredients').where({food : ndbno});
  }
}