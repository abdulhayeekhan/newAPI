const express = require('express');
const router = express.Router();
const db = require('../confige/index')


// 2. Get all countries (GET)
router.get('/getAll', async (req, res) => {
    const query = 'SELECT id,name FROM cities ORDER By name ASC';
    try {
        const results = await db(query); // Call db with the SQL query
        if (results.length === 0) {
            return res.status(404).send('No cites found');
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching cites:', error);
        res.status(500).send('Error fetching cites');
    }
});

// 2. Get all countries (GET)
router.get('/CollectionCenterCities', async (req, res) => {
    const query = 'SELECT id,name FROM cities WHERE isCollectionCenter = 1 ORDER By name ASC';
    try {
        const results = await db(query); // Call db with the SQL query
        if (results.length === 0) {
            return res.status(404).send('No cites found');
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching cites:', error);
        res.status(500).send('Error fetching cites');
    }
});

module.exports = router;