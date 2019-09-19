const ResultsService = {
  getUserSymptomTypes(db, user_id){
    db('symptoms').distinct('type').where({user_id})
  },
  getSymptomByType(db, user_id, type){
    db('symptoms').where({user_id, type})
  },
  getMealsWithinSymptomThreshold(db, user_id, timecode){
    db('meals').where({user_id}).whereBetween('created', [timecode-21600000, timecode])
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