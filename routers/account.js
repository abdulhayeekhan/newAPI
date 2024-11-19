const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../confige/index')
const {getOAuthToken} = require('../controller/ups/authentication')
const JWT_SECRET = 'your_jwt_secret_key';

router.post('/signup', async (req, res) => {
    const { firstName, lastName,userLavel, email, contactNo, password , companyId } = req.body;

    // Input validation (could be extended further)
    if (!email || !password || !firstName || !lastName || !contactNo || !companyId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {

      const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
      const emailData = await db(checkEmailQuery, [email]);
      
      if (emailData.length > 0) {
          return res.status(409).json({ message: 'Email already exists' }); // Conflict status
      }

      const checkCountQuery = 'SELECT * FROM company WHERE id = ?';
      const countData = await db(checkCountQuery, [companyId]);
      
      if (countData[0].maxUser === countData[0].existUser) {
          return res.status(411).json({ message: 'Your maximum users already created' }); // Conflict status
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
  
      const insertQuery = 'INSERT INTO users (firstName, lastName,userLavel,companyId, email, contactNo, password, isActive) VALUES (?, ?,?, ?, ?, ?, ?, ?)';

      const insertResult = await db(insertQuery, [firstName, lastName,userLavel,companyId, email, contactNo, hashedPassword, 1]);
      // Generate a JWT token
      // const token = jwt.sign({ id:insertResult[0].insertId, email }, JWT_SECRET, { expiresIn: '1h' });
      if (!insertResult.affectedRows) {
        return res.status(401).json({ message: 'data not saved' });
      }

      const updateQuery = `
        UPDATE company 
        SET existUser = existUser + 1 
        WHERE id = ?
      `;
      const updateResult = await db(updateQuery, [companyId]);

      return res.status(200).json({ 
        message: 'User registered successfully', 
        data:{
          id: insertResult.insertId,
          firstName,
          lastName,
          email,
          contactNo,
          companyId
        } 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Sign-in Route

  // router.post('/signup', async (req, res) => {
  //   const { firstName, lastName, email, contactNo, password, companyId } = req.body;
  
  //   // Input validation (could be extended further)
  //   if (!email || !password || !firstName || !lastName || !contactNo || !companyId) {
  //     return res.status(400).json({ error: 'All fields are required' });
  //   }
  
  //   try {
  //     // Check if the user already exists
  //     db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
  //       if (err) {
  //         return res.status(500).json({ error: 'Internal server error' });
  //       }
  
  //       if (rows.length > 0) {
  //         return res.status(400).json({ error: 'Email is already in use' });
  //       }
  
  //       // Hash the password
  //       bcrypt.hash(password, 10, (err, hashedPassword) => {
  //         if (err) {
  //           return res.status(500).json({ error: 'Error hashing password' });
  //         }
  
  //         // Insert new user into the database
  //         db.query(
  //           'INSERT INTO users (firstName, lastName, companyId, email, contactNo, password, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
  //           [firstName, lastName, companyId, email, contactNo, hashedPassword, 1],
  //           (err, result) => {
  //             if (err) {
  //               return res.status(500).json({ error: 'Internal server error' });
  //             }
  
  //             // Generate a JWT token
  //             const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  //             return res.status(201).json({ message: 'User registered successfully', token });
  //           }
  //         );
  //       });
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query to check if the user exists
        const query = 'SELECT * FROM users WHERE email = ?';
        const results = await db(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials em' });
        }

        const user = results[0];

        if (user.isActive === 0) {
            return res.status(403).json({ message: 'Your account is not active' });
        }

        const companyQuery = 'SELECT * FROM company WHERE id = ?';
        const companyResult = await db(companyQuery, [user?.companyId]);
        const companyRes = companyResult[0];
        if(companyRes.isActive === 0){
          return res.status(405).json({ message: 'Your company account is currently blocked.' });
        }
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }


        const token = await getOAuthToken();
        console.log(token)
        // Generate JWT token
        //const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Sign in successful', token, data: user });
    } catch (err) {
        console.error('Sign in error:', err);
        return res.status(500).json({ error: 'Database query failed' });
    }
});

router.get('/getByCompany/:id', async (req, res) => {
  const countryId = req.params.id;
  const query = 'SELECT * FROM users WHERE companyId = ? ORDER By id ASC';
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

  
module.exports = router;