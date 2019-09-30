const express = require('express');
const SymptomRouter = express.Router();
require('dotenv').config();
const { USDA_API_KEY } = require('../config');
const jsonBodyParser = express.json();
const SymptomService = require('./symptom-service');
const ResultsService = require('../results/results-service')
const rp = require('request-promise');
const { requireAuth } = require('../middleware/jwt-auth');
//when user searches for Symptom item to add to meal
SymptomRouter.use(requireAuth)
  .get('/', async (req, res, next) => {
    const symptoms = await ResultsService.getUserSymptomTypes(req.app.get('db'), req.user.id);
    res.status(200).json(symptoms);
    next();
  })

  .patch('/', jsonBodyParser, async (req, res, next) => {
    const {id} = req.body;
    const updates = req.body;
    delete updates.id;
    console.log(updates.min_time);
    const updatedSymptom = await SymptomService.patchSymptom(req.app.get('db'), id, updates);
    console.log('updatedSymptom', updatedSymptom);
    res.status(200).json(updatedSymptom)
    next();
  })

  .delete('/:symptom_id', async (req, res, next) => {
    const { symptom_id } = req.params;
    const numDeleted = await SymptomService.deleteSymptomType(req.app.get('db'), req.user.id, symptom_id);
    if (numDeleted === 0) {
      return res.status(400).send({error: 'Invalid symptom user combination'})
    }
    else {
      res.status(204).end();
    }
    next();
  })

module.exports = SymptomRouter;
