const express = require("express");
const EventService = require("./event-service");
const EventRouter = express.Router();
const jsonBodyParser = express.json();

EventRouter.post("/", jsonBodyParser, async (req, res, next) => {
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
        .location(
          path.posix.join(req.originalUrl, `/${user_id}/${response.symptom_id}`)
        )
        .json({ response });
    }
    if (type === "meal") {
      const { items } = req.body;
      const event = {
        user: req.user.id,
        items: items,
        time
      };
      //insert meal first
      const response = await EventService.postMeal(req.app.get("db"), event);
      //then insert foods by ID from array
     
      return res
        .status(201)
        .location(
          path.posix.join(req.originalUrl, `/${user_id}/${response.meal_id}`)
        )
        .json({ response });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = EventRouter