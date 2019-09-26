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
      res.status(400).send({
        error: 'Missing \'type\' in request body'
      });
    }
    if (type === "symptom") {
      
      const { symptom, severity } = req.body;
      if(symptom == null){
        return res.status(400).json({
          error: 'Missing \'symptom\' in request body'
        });
      }
      if(severity == null){
        return res.status(400).json({
          error: 'Missing \'severity\' in request body'
        });
      }
      if(symptom === ''){
        res.status(400).json({error: 'Symptom name is required'})
      }
      const event = {
        user_id: req.user.id,
        type: symptom,
        created: time,
        severity_id: severity
      };
      const response = await EventService.postSymptom(req.app.get("db"), event);
      const severityObj= await EventService.getSeverity(req.app.get("db"), response.severity_id)
      const adjustedResponse = {
        type:'symptom',
        symptom:response.type,
        severityNumber:response.severity_id,
        severity:severityObj.name,
        name:response.type,
        time:response.created,
        id: response.id
      }
      return res
        .status(201)
        .json( adjustedResponse );
    }
    if (type === "meal") {
      const { items,name} = req.body;
      if(items == null){
        return res.status(400).json({
          error: 'Missing \'items\' in request body'
        });
      }
      if(name == null){
        return res.status(400).json({
          error: 'Missing \'name\' in request body'
        });
      }
      const event = {
        user_id: req.user.id,
        name,
        created:time
      };
      //insert meal first
      const response = await EventService.postMeal(req.app.get("db"),  event);
      //insert plates by ndbno and meal id which references user_id
      
      
      await EventService.postPlates(req.app.get("db"), items, response.id)
      let meal ={
        type:'meal',
        id:response.id,
        name:response.name,
        time:response.created,
        items:[]
      }
      let foods = await EventService.getFoodsInMeal(req.app.get('db'),response.id);
      for(let j=0;j<foods.length;j++){
        let food={
          name:foods[j].name
        }
        let ingredients = await EventService.getIngredients(req.app.get('db'),foods[j].ndbno);
        food.ingredients= ingredients.map(ingredient=>ingredient.name);
        meal.items.push(food)
        food.ndbno=foods[j].ndbno
      }
      return res
        .status(201)
        .json(meal);
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
      id:meals[i].id,
      name:meals[i].name,
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
  let symptoms = await EventService.getAllSymptoms(req.app.get('db'), user_id);
  for(let i=0; i<symptoms.length;i++){
    //might have problems here, not really able to test
    events.push({
      type:'symptom',
      symptom:symptoms[i].type,
      severityNumber:symptoms[i].severity_id,
      severity:symptoms[i].name,
      name:symptoms[i].type,
      time:symptoms[i].created,
      id: symptoms[i].id
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
  .status(200)
  .json(result)
 
  })
  .delete('/', jsonBodyParser, async (req, res, next) => {
    const {type, id} = req.body;
    console.log(type, id);
    if (type === 'meal') {
      EventService.deleteMeal(req.app.get('db'), id)
      .then(() => {
        res.status(204).send();
      })
    }
    else {
      EventService.deleteSymptom(req.app.get('db'), id)
      .then(() => {
        res.status(204).send();
      })
    }
  })


module.exports = EventRouter