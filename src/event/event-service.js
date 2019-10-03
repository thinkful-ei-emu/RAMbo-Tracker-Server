const EventService = {
  postMeal(db, event) {
    return db
      .from("meals")
      .insert(event)
      .returning("*")
      .then(([meal]) => meal);
  },

  getMealById(db,id) {
    return db
      .from('meals')
      .where('id', id)
      .first();
  },

  deleteMeal(db, id) {
    return db
      .from('meals')
      .delete()
      .where('id', id)
      .then(() => {
        return db
          .from('plates')
          .delete()
          .where('meal', id)
      })
  },

  getSymptomEventById(db,id) {
    return db 
      .from('symptoms')
      .where('id', id)
      .first();
  },

  deleteSymptom(db, id) {
    return db 
      .from('symptoms')
      .delete()
      .where('id', id)
  },

  async getIngredients(db, ndbno){
    return db
      .select('ingredients.name')
      .from("ingredients")
      .where('ingredients.food',ndbno)
  },

  getMealsFromUser(db,user_id){
    return db
      .select('*')
      .from('meals')
      .where('meals.user_id',user_id)
  },

  getFoodsInMeal(db, mealid){
    return db
      .select('food.name','food.ndbno')
      .from('plates')
      .join('food','plates.food', 'food.ndbno')
      .where('plates.meal',mealid)
  },

  async postPlates(db, items, mealId) {
    for (let i = 0; i < items.length; i++) {
      await this.postPlate(db, items[i], mealId);
    }
  },
  postPlate(db, ndbno, mealId) {
    return db.from("plates").insert({ food: ndbno, meal: mealId });
  },
  getIngredientsForFood(db, ndbno) {
    return db
      .select("ingredients.name as ingredient_name")
      .from("ingredients")
      .join("food", "food.ndbno", "ingredients.food")
      .where("food.ndbno", ndbno);
  },
  getAllSymptomEvents(db, symptoms) {
    return db
      .from('symptoms')
      .join('user_symptom', 'user_symptom.id', 'symptoms.type_id')
      .join("severity", "severity.id", "symptoms.severity_id")
      .whereIn('symptoms.type_id', symptoms)
      .select('severity.id as severity_id', 'type', 'user_id', 'created', 'name', 'symptoms.id as id')
  },

  postSymptomEvent(db, event) {
    return db
      .from('symptoms')
      .insert(event)
      .returning("*")
      .then(([s]) => s);;
  },

  getSeverity(db,id){
    return db
      .from('severity')
      .select('*')
      .where({id})
      .first();
  },

  getSymptomTypeId(db, user_id, type) {
    return db
      .select('id')
      .from('user_symptom')
      .where({user_id, type})
      .first()
      .then(res => {
        return (res) ? res.id : null
      })
  },

  postSymptomType(db, user_id, type) {
    return db
      .from('user_symptom')
      .insert({
        user_id,
        type
      })
      .returning('id')
      .then(([res]) => {
        return res;
      })
  },

  getUserBySymptom(db, id) {
    return db
      .select('user_id')
      .from('user_symptom')
      .join('symptoms', 'symptoms.type_id', 'user_symptom.id' )
      .where('symptoms.id', id)
      .then(([res]) => {
        return res.user_id;
      })

  },

  getSymptomTypesByUser(db, user_id) {
    return db
      .from('user_symptom')
      .select('id')
      .where({user_id})
      .then(res => {
        return res;
      })
  }
};

module.exports = EventService;
