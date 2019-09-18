const EventService = {
  postMeal(db, newMeal, user_id){
    return db
    .from('meals')
    .insert({user_id})
    //db..insert into...new meal
  },
  postPlates(db, event, mealId){
    for(let i=0; i < event.items.length; i++){
      await this.postPlate(db, event.items[i], mealId)
    }
  },
  postSymptom(db, newSymptom, /* user_id */){
    //db...insert into...newSymptom
    return newSymptom
  }
}

module.exports = EventService