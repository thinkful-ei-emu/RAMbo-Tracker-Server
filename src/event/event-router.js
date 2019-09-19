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
        user_id: req.user.id,
        type: symptom,
        created: time,
        severity_id: severity
      };
      const response = await EventService.postSymptom(req.app.get("db"), event);
      console.log('post symptom response', response);
      return res
        .status(201)
        .json({ response });
    }
    if (type === "meal") {
      const { items } = req.body;
      const event = {
        user_id: req.user.id,
        items: items,
       
      };
      //insert meal first
      const response = await EventService.postMeal(req.app.get("db"), user_id);
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
});

module.exports = EventRouter