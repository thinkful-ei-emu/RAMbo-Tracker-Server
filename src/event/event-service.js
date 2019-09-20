const EventService = {
  postMeal(db, event) {
    return db
      .from("meals")
      .insert(event)
      .returning("*")
      .then(([meal]) => meal);
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
  /* async getAllUserData(db, user_id) {
    let meals = await this.getAllMeals(db, user_id);
    let symptoms = await this.getAllSymptoms(db, user_id);
    let mealsAndSymptoms = [];
    for (let i = 0; i < meals.length; i++) {
      let ingredientArr = [];
      let ingredient = await this.getIngredientsForFood(db, meals[i].ndbno);
      ingredientArr.push(ingredient);
      meals[i].ingredients = ingredientArr[0];
    }
    for (let i = 0; i < meals.length; i++) {
      let ingredientArrStr = [];
      meals[i].ingredients.forEach(obj => {
        ingredientArrStr.push(obj.ingredient_name);
      });
      meals[i].ingredients = ingredientArrStr;
    }
  
    symptoms.sort((a, b) => a.created - b.created);
    for (let i = 0; i < meals.length; i++) {
      symptoms.push(meals[i]);
    }
    return symptoms;
  }, */
  getIngredientsForFood(db, ndbno) {
    return db
      .select("ingredients.name as ingredient_name")
      .from("ingredients")
      .join("food", "food.ndbno", "ingredients.food")
      .where("food.ndbno", ndbno);
  },
  /* getAllMeals(db, user_id) {
    //SELECT food.name, ingredients.name, plates.meal, meals.created FROM food JOIN plates ON plates.food = food.ndbno JOIN ingredients ON ingredients.food = food.ndbno JOIN meals ON meals.id = plates.meal WHERE meals.user_id = 1;
    return db
      .select(
        "food.name as food_name",
        "food.ndbno as ndbno",
        "plates.meal",
        "meals.created"
      )
      .from("food")
      .join("plates", "plates.food", "food.ndbno")
      .join("meals", "meals.id", "plates.meal")
      .where("meals.user_id", user_id);
  }, */
  getAllSymptoms(db, user_id) {
    return db
      .from("symptoms")
      .join("severity", "severity.id", "symptoms.severity_id")
      .where({ user_id });
  },
  postSymptom(db, newSymptom /* user_id */) {
    //db...insert into...newSymptom
    return db
      .from('symptoms')
      .insert({ 'type':newSymptom.type, 'user_id':newSymptom.user_id, 'severity_id':newSymptom.severity_id, 'created':newSymptom.time })
      .returning("*")
      .then(([s]) => s);;
  }
};

module.exports = EventService;
