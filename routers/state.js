const express = require('express');
const router = express.Router();
const db = require('../confige/index')

router.get('/getAll', async(req, res) => {
    const query = 'SELECT * FROM state';
    try {
        const results = await db(query); // Call db with the SQL query
        if (results.length === 0) {
          return res.status(404).send('No state found for shipping');
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching state:', error);
        res.status(500).send('Error fetching state');
    }
});


router.get('/getByCountry/:id', async (req, res) => {
    const countryId = req.params.id;
    const query = 'SELECT * FROM state WHERE countryId = ? ORDER By state ASC';
    try {
        const results = await db(query, [countryId]); // Call db as a function
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
    }
  });

//   router.get('/user/:id', async (req, res) => {
//     const userId = req.params.id;
//     const query = 'SELECT id, email, contactNo, isActive FROM users WHERE id = ?';

//     try {
//         const results = await db(query, [userId]); // Call db as a function
//         if (results.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(results[0]);
//     } catch (err) {
//         console.error('Database query error:', err);
//         return res.status(500).json({ error: 'Database query failed' });
//     }
// });
  

module.exports = router;