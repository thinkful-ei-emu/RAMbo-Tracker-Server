require('dotenv').config();
const express = require('express');
const SymptomRouter = express.Router();
const jsonBodyParser = express.json();
const SymptomService = require('./symptom-service');
const ResultsService = require('../results/results-service')
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
    const updatedSymptom = await SymptomService.patchSymptom(req.app.get('db'), id, updates);
    console.log('updatedSymptom', updatedSymptom);
    if (!updatedSymptom.length) { 
      res.status(400).json({error: 'Symptom ID not found'})
      next();
    }
    else {
      res.status(200).json(updatedSymptom[0])
      next();
    }
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
