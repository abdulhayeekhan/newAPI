const express = require('express');
const router = express.Router();
const db = require('../confige/index')

  // 2. Get all countries (GET)
  router.get('/getAll', async(req, res) => {
      const query = 'SELECT * FROM countries ORDER By country ASC';
      try {
        const results = await db(query); // Call db with the SQL query
        if (results.length === 0) {
          return res.status(404).send('No countries found for shipping');
        }
        res.json(results);
      } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).send('Error fetching countries');
      }
  });


  router.get('/getById/:id', async (req, res) => {
    const { id } = req.params;  // Extract the 'id' parameter from the URL
    try {
      // Query the database for a single country with the provided id
      const results = await db('SELECT * FROM countries WHERE id = ?', [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Country not found' });  // Return 404 if no results found
      }
  
      res.status(200).json(results[0]);  // Return the first (and only) result
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({ message: 'Error fetching country', error: error.message });
    }
  });
  
  router.get('/getShipTo', async (req, res) => {
    const query = 'SELECT * FROM countries WHERE isShipTo = 1';
    try {
      // Query for countries where either isShipFrom or isShipTo is 1
      const results = await db(query);
      
      // Check if any countries were found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No shipTo countries found' });
      }
  
      res.status(200).json(results);  // Return the list of active countries
    } catch (error) {
      console.error('Error fetching active countries:', error);
      res.status(500).json({ message: 'Error fetching active countries', error: error.message });
    }
  });

  router.get('/getShipFrom', async (req, res) => {
    try {
      // Query for countries where either isShipFrom or isShipTo is 1
      const results = await db('SELECT * FROM countries WHERE isShipFrom = 1');
      
      // Check if any countries were found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No shipFrom countries found' });
      }
  
      res.status(200).json(results);  // Return the list of active countries
    } catch (error) {
      console.error('Error fetching active countries:', error);
      res.status(500).json({ message: 'Error fetching active countries', error: error.message });
    }
  });

  router.get('/getUPS', async (req, res) => {
    try {
      // Query for countries where either isShipFrom or isShipTo is 1
      const results = await db('SELECT * FROM countries WHERE isUPS = 1');
      
      // Check if any countries were found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No shipFrom countries found' });
      }
  
      res.status(200).json(results);  // Return the list of active countries
    } catch (error) {
      console.error('Error fetching active countries:', error);
      res.status(500).json({ message: 'Error fetching active countries', error: error.message });
    }
  });

  router.get('/getDPD', async (req, res) => {
    try {
      // Query for countries where either isShipFrom or isShipTo is 1
      const results = await db('SELECT * FROM countries WHERE isDPD = 1');
      
      // Check if any countries were found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No shipFrom countries found' });
      }
  
      res.status(200).json(results);  // Return the list of active countries
    } catch (error) {
      console.error('Error fetching active countries:', error);
      res.status(500).json({ message: 'Error fetching active countries', error: error.message });
    }
  });

module.exports = router;