const express = require('express')
const MealRouter = express.Router()
const jsonBodyParser = express.json()
const path = require('path')
const MealService = require('./MealService')
/* POST /event
  request(numbers are ids of foods selected in the USDA database):
    {
      type: meal,
      items: [123123, 234, 2345356, 1345, 4356546],
      time: 123123123
    }
  response: 201 created */
MealRouter
.post('/', jsonBodyParser, async (req, res)=>{
  const { meal, items, time} = req.body 
  const newMeal = { meal, items, time}
  for (const field of ["meal", "items", "time"])
      if (!req.body[field])
        return res
          .status(400)
          .json({ error: `Missing ${field} in request body` });
    
  const response = await MealService.addNewMeal(/* req.app.get('db'), */ newMeal/*userId*/)
  return res
  .status(201)
  .location(path.posix.join(req.originalUrl, `/${meal.id}`))
  .json({response})

})

module.exports = MealRouter