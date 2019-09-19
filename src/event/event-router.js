const express = require("express");
const EventService = require("./event-service");
const EventRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');


EventRouter
.use(requireAuth)
.post("/", jsonBodyParser, async (req, res, next) => {
  try {
    const { type, time } = req.body;
    if (!type) {
      res.status(400).send("no type included");
    }
    if (type === "symptom") {
      const { symptom, severity } = req.body;
      const event = {
        user: req.user.id,
        symptom,
        time,
        severity
      };
      const response = await EventService.postSymptom(req.app.get("db"), event);
      return res
        .status(201)
        .json({ response });
    }
    if (type === "meal") {
      const { items,name } = req.body;
      const event = {
        user: req.user.id,
        items,
        name
       
      };
      //insert meal first
      const response = await EventService.postMeal(req.app.get("db"),  event.user,name);
      //insert plates by ndbno and meal id which references user_id
      
      
      await EventService.postPlates(req.app.get("db"), event, response.id)
      
      return res
        .status(201)
        .json({ response });
    }
    next();
  } catch (error) {
    next(error);
  }
})
.get('/', async (req, res, next)=>{
  let user_id=req.user.id;
  let meals = await EventService.getMealsFromUser(req.app.get('db'), user_id);
  let events=[];
  for(let i=0; i<meals.length;i++){
    let meal ={
      type:'meal',
      name:meals[i].id,
      time:meals[i].created,
      items:[]
    }
    let foods = await EventService.getFoodsInMeal(req.app.get('db'),meals[i].id);
    for(let j=0;j<foods.length;j++){
      let food={
        name:foods[j].name
      }
      let ingredients = await EventService.getIngredients(req.app.get('db'),foods[j].ndbno);
      food.ingredients= ingredients.map(ingredient=>ingredient.name);
      meal.items.push(food)
      food.ndbno=foods[j].ndbno
    }
    events.push(meal)
  }
  console.log(events)
  let symptoms = await EventService.getAllSymptoms(req.app.get('db'), user_id);
  console.log(symptoms)
  for(let i=0; i<symptoms.length;i++){
    //might have problems here, not really able to test
    events.push({
      type:'symptom',
      symptom:symptoms[i].type,
      severityNumber:symptoms[i].severity_id,
      severity:symptoms[i].name,
      name:symptoms[i].type,
      time:symptoms[i].created
    })
  }
  //maybe wrong direction
  events.sort((a,b)=> new Date(b.time).getTime()-new Date(a.time).getTime());
  let result={ 
    username:req.user.username,
    display_name:req.user.display_name, 
    events
  }
  return res
  .status(201)
  .json(result)
 
  });


module.exports = EventRouter