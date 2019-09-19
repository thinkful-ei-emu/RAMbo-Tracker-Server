const express = require("express");
const ResultsRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');


ResultsRouter
  .use(requireAuth)
  .get('/', async (req, res, next) => {
    const user = req.user;
    let results = [];
    

  })