const express = require('express');
const router = express.Router();
const db = require('../confige/index')
const {AddFlightStatus} = require('../controller/flight/add');


router.post('/add', async (req, res) => {
    const flightsInfo = req.body;
    
    try {
      const result = await AddFlightStatus(flightsInfo);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save flight data' });
    }
});


module.exports = router;