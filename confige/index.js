const mysql = require('mysql2/promise'); // Use promise-based API

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0, // No limit on queued connection requests
});

// Function to query the database
const db = async(sql, params)=> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error; // Propagate the error
  } finally {
    connection.release(); // Always release the connection
  }
}

module.exports = db