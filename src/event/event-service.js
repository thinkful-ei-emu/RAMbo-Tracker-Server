const EventService = {
  postMeal(db, user_id){
    return db
    .from('meals')
    .insert({user_id})
    .returning('*')
    .then(([meal]) => meal)
  },

  /**
   * for each food item in event, we post it into 'plates' along with mealid
   */
  async postPlates(db, event, mealId){
    for(let i=0; i < event.items.length; i++){
      await this.postPlate(db, event.items[i], mealId)
    }
  },
  postPlate(db, ndbno, mealId){
    return db
    .from('plates')
    .insert({'food': ndbno, 'meal': mealId})
  },
  postSymptom(db, newSymptom){
    return db("symptoms")
    .insert(newSymptom)
    .returning('*')
  }
}

module.exports = EventService