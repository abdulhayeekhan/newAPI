const express = require('express');
const router = express.Router();
const db = require('../confige/index')

// router.get('/getAll', async (req, res) => {
//     const sql = 'SELECT * FROM company ORDER By id DESC';
//     try {
//       const results = await db(sql);  // Call the db function
//       if (results.length === 0) {
//         return res.status(404).json({ message: 'Company not found' });
//       }
//       res.json(results);  // Send the results as JSON
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching companies', error: error.message });
//     }
//   });

// router.post('/getAll', async (req, res) => {
//   // Get query parameters (pageNo, pageSize, companyName)
//   const { pageNo , pageSize, companyName } =  req.body;

//   // Set the offset based on pageNo and pageSize for pagination
//   const offset = (pageNo - 1) * pageSize;

//   // Start building the SQL query
//   let sql = 'SELECT * FROM company';

//   // If a companyName is provided, add a WHERE clause to filter by companyName
//   if (companyName) {
//     sql += ` WHERE companyName LIKE ?`;
//   }

//   // Add pagination (limit and offset) to the query
//   sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;

//   try {
//     // Query to get the companies with pagination and optional filtering by companyName
//     if(companyName){
//       const results = await db(sql, [`%${companyName}%`, pageSize, offset]);
//     }else{
//       const results = await db(sql, [pageSize, offset]);
//     }
    

//     // Query to get the total count of companies (including those filtered by companyName)
//     let countQuery = 'SELECT COUNT(*) AS totalCount FROM company';
//     if (companyName) {
//       countQuery += ' WHERE companyName LIKE ?';
//     }

//     const countResult = await db(countQuery, [`%${companyName}%`]);
//     const totalCount = countResult[0].totalCount;

//     // If no companies are found, return 404
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No companies found' });
//     }

//     // Return the paginated response along with total count
//     res.json({
//       totalCount,
//       pageNo: Number(pageNo),
//       pageSize: Number(pageSize),
//       totalPages: Math.ceil(totalCount / pageSize),
//       data: results,
//     });

//   } catch (error) {
//     // Handle any errors and return a 500 status code
//     res.status(500).json({ message: 'Error fetching companies', error: error.message });
//   }
// });

router.post('/getAll', async (req, res) => {
  // Extract pagination and filtering parameters from the request body
  const { pageNo , pageSize , companyName } = req.body;

  // Set the offset based on pageNo and pageSize for pagination
  const offset = (pageNo - 1) * pageSize;

  // Start building the SQL query
  let sql = 'SELECT * FROM company';

  // If a companyName is provided, add a WHERE clause to filter by companyName
  if (companyName) {
    sql += ` WHERE companyName LIKE ?`;
  }

  // Add pagination (limit and offset) to the query
  sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;

  try {
    // Query to get the companies with pagination and optional filtering by companyName
    let results;
    if (companyName) {
      results = await db(sql, [`%${companyName}%`, pageSize, offset]);
    } else {
      results = await db(sql, [pageSize, offset]);
    }

    // Query to get the total count of companies (including those filtered by companyName)
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM company';
    if (companyName) {
      countQuery += ' WHERE companyName LIKE ?';
    }

    const countResult = await db(countQuery, [`%${companyName}%`]);
    const totalCount = countResult[0].totalCount;

    // If no companies are found, return 404
    if (results.length === 0) {
      return res.status(404).json({ message: 'No companies found' });
    }

    // Return the paginated response along with total count
    res.json({
      totalCount,
      pageNo: Number(pageNo),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalCount / pageSize),
      data: results,
    });

  } catch (error) {
    // Handle any errors and return a 500 status code
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
});

router.get('/getAllList', async(req, res) => {
  const query = 'SELECT * FROM company ORDER By companyName ASC';
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

  router.post('/add', async (req, res) => {
    const { companyName, email, contactNo, address,labelCount,maxUser,isActive,createdBy } = req.body; // Assuming these fields exist in the request body
  
    if (!companyName || !address || !contactNo || !email) {
      return res.status(400).json({ message: 'All fields (name, address, phone, email) are required' });
    }
  
    const sql = 'INSERT INTO company (companyName, email, contactNo, address,labelCount,maxUser,isActive,createdBy) VALUES (?, ?, ?, ?, ?,?,?,?)';
    try {
      const result = await db(sql, [companyName, email, contactNo, address,labelCount,maxUser,isActive,createdBy]);  // Insert the new company into the database
      res.status(200).json({ 
        message: 'Company added successfully', 
        data:{id: result.insertId,
            companyName,
            email,
            contactNo,
            labelCount,
            maxUser,
            isActive
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error adding company', error: error.message });
    }
  });
  
  // Example route to get a company by ID
  router.get('/getSingle/:id', async (req, res) => {
    const companyId = req.params.id;
    console.log("companyId",companyId)
    try {
      const sql = 'SELECT * FROM company WHERE id = ?';
      const company = await db(sql, [companyId]);  // Pass parameters as an array
      if (company.length === 0) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company[0]);  // Return the first (and only) result
    } catch (error) {
      res.status(500).json({ message: 'Error fetching company', error: error.message });
    }
  });


  router.put('/update', async (req, res) => {
    //const companyId = req.params.companyId;  // Get companyId from URL params
    const {companyId, companyName, contactNo, address, labelCount, maxUser, isActive } = req.body;  // Assuming these fields exist in the request body
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
  
    // Ensure required fields are present
    if (!companyName || !address || !contactNo) {
      return res.status(400).json({ message: 'All fields (name, address, phone) are required' });
    }
  
    // SQL query to update the company details based on companyId
    const sql = `
      UPDATE company
      SET companyName = ?, contactNo = ?, address = ?, labelCount = ?, maxUser = ?, isActive = ?
      WHERE id = ?
    `;
    
    try {
      // Execute the SQL query to update the company record
      const result = await db(sql, [companyName, contactNo, address, labelCount, maxUser, isActive, companyId]);
      
      // Check if any rows were affected (i.e., the company record was found and updated)
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // Send response after successful update
      res.status(200).json({
        message: 'Company updated successfully',
        data: {
          companyId,
          companyName,
          contactNo,
          labelCount,
          maxUser,
          isActive
        }
      });
    } catch (error) {
      // Catch any errors and send a failure response
      res.status(500).json({ message: 'Error updating company', error: error.message });
    }
  });
  

module.exports = router;