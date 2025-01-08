const express = require('express');
const router = express.Router();
const db = require('../confige/index')
const {AddFlightStatus,GetFlightInfo,GetFlightList} = require('../controller/flight');


router.post('/add', async (req, res) => {
    const flightsInfo = req.body;
    try {
      const result = await AddFlightStatus(flightsInfo);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save flight data' });
    }
});

router.post('/GetSingle', async (req, res) => {
  const {id} = req.body;
  
  try {
    const result = await GetFlightInfo(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save flight data' });
  }
});

router.post('/GetAll', async (req, res) => {
    const {pageNo,pageSize,companyId,startDate,endDate,userId,flightId} = req.body;
    try {
      const result = await GetFlightList({pageNo,pageSize,companyId,startDate,endDate,userId,flightId});
      res.json(result);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to get flights data' });
    }
  });


module.exports = router;