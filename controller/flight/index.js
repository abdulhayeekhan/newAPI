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
    const detailResult = await db(detailsQuery, detailValues);


    // update status in shipment table
    const shipmentIds = details?.flatMap(d => [ // Use the newly inserted id
        d.shipmentId,
    ]);
    const queryUpdate = `UPDATE shipment SET isUpdated = true WHERE id IN (${shipmentIds.map(() => '?').join(', ')})`;
    await db(queryUpdate, shipmentIds);
    // End update status in shipment table


   
    return {
        id:resultflight.insertId,
        details:detailResult
    }

}

const GetFlightInfo = async(id) =>{
    const sql = 'SELECT track.*,users.firstName,users.lastName,com.companyName FROM flights_track as track INNER JOIN company as com ON com.id = track.companyID INNER JOIN users ON users.id = track.createdBy WHERE track.id = ? AND track.idDeleted = 0';
    const flightInfo = await db(sql, [id]);  // Pass parameters as an array
    if (flightInfo.length === 0) {
      return  { message: 'flight not found' };
    }

    const sqldata = `SELECT 
    confige.*, 
    ship.trackingNo, 
    sts.name AS StatusName, 
    sts.bg_color AS StatusBgColor, 
    sts.text_color AS StatusTextColor 
    FROM 
        flights_confige_shipment AS confige 
    INNER JOIN 
        shipment AS ship ON ship.id = confige.shipmentId 
    INNER JOIN 
        flightstatus AS sts ON sts.id = confige.statusID 
    WHERE 
        confige.trackId = ? 
        AND confige.isActive = 1;`
    const detailInfo = await db(sqldata, [id]);

    //flightInfo.length === 0
    let data  = flightInfo[0]
    return {
        id: data.id,
        companyID: data?.companyID,
        companyName: data?.companyName,
        awb: data?.awb,
        createdAt: data?.createdAt,
        createdBy: data?.firstName+" "+data?.lastName,
        shipDate: data?.shipDate,
        detailInfo:detailInfo
    }
    //res.json(flightInfo[0]);  // Return the first (and only) result
}

// const GetFlightsList = async() => {

// }

module.exports = { AddFlightStatus,GetFlightInfo };