const express = require('express');
const EventService = require('./event-service');
const EventRouter = express.Router();
const jsonBodyParser = express.json();


EventRouter
  .use(jsonBodyParser);

EventRouter
  .post('/', async (req, res, next) => {
    try{
      const {type, time} = req.body;
      if(!type){
        res.status(500).send('no type included')
      }
      if(type === 'symptom'){
        const {symptom, severity} = req.body;
        const event = {
          user: req.user.id,
          symptom, 
          time, 
          severity
        };
        await EventService.postSymptom(req.app.get('db'), event);
        res.status(201).send('created');
      }
      if(type === 'meal'){
        const {items} = req.body;
        const event = {
          user: req.user.id,
          items: items,
          time
        };
        await EventService.postMeal(req.app.get('db'), event);
        res.status(201).send('created');
      }
      next();
    }
    catch(error){
      next(error);
    }
    

  })

