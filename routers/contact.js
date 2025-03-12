const express = require('express');
const router = express.Router();
const db = require('../confige/index')

  // 2. Get all countries (GET)
  router.get('/GetAll', async(req, res) => {
      const query = 'SELECT * FROM contactUs ORDER By id DESC';
      try {
        const results = await db(query); // Call db with the SQL query
        if (results.length === 0) {
          return res.status(404).send('No contactUs found');
        }
        res.json(results);
      } catch (error) {
        console.error('Error fetching contactUs:', error);
        res.status(500).send('Error fetching contactUs');
      }
  });


  router.post('/Add', async (req, res) => {
    const { name, email, subject, message,createdBy } = req.body; // Assuming these fields exist in the request body
  
    if (!name || !email || !subject || !message || !createdBy) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message,createdBy) are required' });
    }
  
    const sql = 'INSERT INTO contactUs (name, email, subject, message,createdBy) VALUES (?,?,?,?,?)';
    try {
      const result = await db(sql, [name, email, subject, message,createdBy]);  // Insert the new company into the database
      res.status(200).json({ 
        message: 'Congrats! Your information has been stored successfully.', 
        data:{id: result.insertId,
            name,
            email,
            subject,
            message
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error adding contactUs information', error: error.message });
    }
  });

  router.put('/Update/:id', async (req, res) => {
    const { id } = req.params; // Extracting id from URL parameters
    const { name, email, subject, message, createdBy } = req.body; // Extracting data from request body

    if (!name || !email || !subject || !message || !createdBy) {
        return res.status(400).json({ message: 'All fields (name, email, subject, message, createdBy) are required' });
    }

    const sql = 'UPDATE contactUs SET name = ?, email = ?, subject = ?, message = ?, createdBy = ? WHERE id = ?';

    try {
        const result = await db(sql, [name, email, subject, message, createdBy, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact entry not found' });
        }

        res.status(200).json({ 
            message: 'Contact information updated successfully', 
            data: { id, name, email, subject, message, createdBy } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact information', error: error.message });
    }
  });


  router.get('/GetMyUsersList/:id', async (req, res) => {
    const { id } = req.params;  // Extract the 'id' parameter from the URL
    const query = 'SELECT * FROM contactUs WHERE createdBy = ? ORDER By id ASC';
      try {
        const results = await db(query,[id]); // Call db with the SQL query
        if (results.length === 0) {
          return res.status(404).send('No contactUs found');
        }
        res.json(results);
      } catch (error) {
        console.error('Error fetching contactUs:', error);
        res.status(500).send('Error fetching contactUs');
    }
  });

  router.get('/GetSingleData/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'SELECT * FROM contactUs WHERE id = ?';
        const company = await db(sql, [id]);  // Pass parameters as an array
        if (company.length === 0) {
          return res.status(404).json({ message: 'contactUs not found' });
        }
        res.json(company[0]);  // Return the first (and only) result
      } catch (error) {
        res.status(500).json({ message: 'Error fetching contactUs', error: error.message });
      }
  });

  router.delete('/Delete/:id', async (req, res) => {
    const { id } = req.params; // Extracting id from URL parameters

    const sql = 'DELETE FROM contactUs WHERE id = ?';

    try {
        const result = await db(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact entry not found' });
        }

        res.status(200).json({ message: 'Contact entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact entry', error: error.message });
    }
});

  


module.exports = router;