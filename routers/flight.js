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

router.post('/GetTrackID', async (req, res) => {
    const {companyId,trackingNo} = req.body;
    let query = `SELECT * FROM shipment WHERE 1=1`;
    const params = [];
    if(companyId){
      query += ` AND clientCompanyId = ?`;
      params.push(companyId);
    }
    if(trackingNo){
      if(companyId){
        query += ` AND trackingNo = ?`;
        params.push(trackingNo);
      }
    }
    try {
      const trackingResult = await db(query, params);
      console.log(trackingResult[0]);
      if(trackingResult.length === 0){
        return res.status(409).json({ message: 'Tracking No not exist' });
      }
      if(trackingResult[0].isUpdated !== 0){
        return res.status(409).json({ message: 'This Tracking ID is already linked to another flight' });
      }
      res.json({
          id:trackingResult[0].id,
          status:trackingResult[0].trackingNo,
          bags:trackingResult[0].boxes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save flight data' });
    }
});

router.get('/GetActiveStatus', async (req, res) => {
  let query = `SELECT id,name,bg_color,text_color FROM flightstatus WHERE isActive = 1 ORDER BY sortOrder ASC`;
  try {
    const statusResult = await db(query);
    if(statusResult.length === 0){
      return res.status(409).json({ message: 'Status Not Founds' });
    }
    res.json(statusResult);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status list' });
  }
});


module.exports = router;