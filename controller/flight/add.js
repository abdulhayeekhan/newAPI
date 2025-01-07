const express = require('express');
const axios = require('axios');
const app = express();
const db = require('../../confige/index')
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
// Middleware to parse JSON bodies
app.use(express.json());
const UPS_API_URL = process.env.UPS_API_URL

const AddFlightStatus = async(flightsInfo) => {
    const {companyID,awb,createdBy,shipDate,details} = flightsInfo;
    const sql = `INSERT INTO flights_track (companyID, awb, createdBy,shipDate) 
                    VALUES (?,?,?,?)`;

    // Use your db function to execute the query
    const resultflight = await db(sql, [companyID , awb, createdBy, shipDate]);
    let insertedFlightId = resultflight.insertId;

    const detailsQuery = `INSERT INTO flights_confige_shipment (trackId, shipmentId, bags, statusID)
              VALUES ${details?.map(() => '(?,?,?,?)').join(', ')}`;

    const detailValues = details?.flatMap(d => [
        insertedFlightId,  // Use the newly inserted id
        d.shipmentId,
        d.bags,
        d.statusID
    ]);
    await db(detailsQuery, detailValues);
    
    console.log("detail:",detailsQuery);
    return {
        resultflight,
        details:detailsQuery
    }

}
module.exports = { AddFlightStatus };