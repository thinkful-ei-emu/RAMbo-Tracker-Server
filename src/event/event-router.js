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
      const { items } = req.body;
      const event = {
        user: req.user.id,
        items: items,
       
      };
      //insert meal first
      const response = await EventService.postMeal(req.app.get("db"), event.user );
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