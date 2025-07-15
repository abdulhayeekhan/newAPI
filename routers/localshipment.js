const express = require('express');
const router = express.Router();
const db = require('../confige/index')
const moment = require('moment-timezone');

// Helper: Sanitize undefined → null
function sanitizeParams(params) {
    return params.map(val => (typeof val === 'undefined' ? null : val));
}


router.get('/getShipmentStatus', async (req, res) => {
    const IsForUK = req.query.IsForUK ?? 0;
    const query = 'SELECT Id,StatusName,IsLinkWithCity,IsForUK,SortOrder FROM `deliveryStatus` WHERE IsForUK = ? OR IsForUK IS NULL AND isActive = 1 ORDER By SortOrder ASC';
    try {
        const results = await db(query, [IsForUK]); // Call db with the SQL query
        if (results.length === 0) {
            return res.status(404).send('No countries found for shipping');
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).send('Error fetching countries');
    }
});


router.post('/createClientAndShipment', async (req, res) => {
    const {
        FirstName,
        LastName,
        CNIC,
        ContactNo,
        Email,
        PostalCode,
        CountryId = 178,
        StateId = 72,
        CityId,
        CreatedBy,
        ModifiedBy,
        Weight,
        WeightUnit,
        Description,
        BookingCityId,
        IsForUK = 1,
        ShipmentStatus = 1
    } = req.body;

    const createdAtPKT = moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');

    try {
        // 1. Insert into clientInfo
        const sql1 = `
      INSERT INTO clientInfo (
        FirstName, LastName, CNIC, ContactNo, Email, PostalCode,
        CountryId, StateId, CityId, CreatedBy, ModifiedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result1 = await db(sql1, [
            FirstName, LastName, CNIC, ContactNo, Email, PostalCode,
            CountryId, StateId, CityId, CreatedBy, ModifiedBy
        ]);

        const clientId = result1.insertId;

        // 2. Generate Tracking ID
        const trackingId = 'THC' + Math.floor(1000000 + Math.random() * 9000000);

        // 3. Insert into LocalShipmentInformation
        const sql2 = `
            INSERT INTO LocalShipmentInformation (
                TrackingId, ClientId, Weight, WeightUnit, Description,
                BookingCityId, IsForUK, CreatedBy
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
        const result2 = await db(sql2, [
            trackingId, clientId, Weight, WeightUnit, Description,
            BookingCityId, IsForUK, CreatedBy
        ]);

        const shipmentId = result2.insertId

        const isCity = 1;
        const sql3 = `INSERT INTO localShipmentLog (
            TrackingId, ClientId, StatusId, ShipmentId, CreatedBy,
            CreatedAt,isCity,CityId
        )
        VALUES (?, ? , ? , ? , ?, ?, ?, ?)`;

        await db(sql3, [trackingId, clientId, ShipmentStatus, shipmentId, CreatedBy, createdAtPKT, isCity, BookingCityId]);

        res.status(201).json({
            success: true,
            message: 'Client and shipment created successfully',
            clientId,
            trackingId
        });
    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({ success: false, error: 'Insert failed' });
    }
});



router.post('/UpdateShipmentStatus', async (req, res) => {
    const { shipmentIds, statusId, createdBy } = req.body;

    console.log('statusId:', statusId)

    // Input validation
    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0 || !statusId) {
        return res.status(400).json({
            error: 'shipmentIds (array) and statusId are required.'
        });
    }

    try {
        const createdAt = moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');
        const insertedLogs = [];

        for (const shipmentId of shipmentIds) {
            // 1. Check if status already exists
            const checkSql = `
        SELECT COUNT(*) AS count FROM localShipmentLog
        WHERE ShipmentId = ? AND StatusId = ?
      `;
            const [check] = await db(checkSql, [shipmentId, statusId]);
            if ((check?.count ?? 0) > 0) continue;

            // 2. Get shipment info
            const fetchSql = `
        SELECT TrackingId,ClientId,BookingCityId FROM LocalShipmentInformation
        WHERE Id = ?
      `;
            const info = await db(fetchSql, [shipmentId]);

            if (info.length === 0) continue;

            let isCity = 0
            let CityId = null
            const { TrackingId, ClientId, BookingCityId } = info[0] ?? {};

            if (statusId === 2) {
                isCity = 1
                CityId = BookingCityId
            }
            // 3. Prepare insert
            const insertSql = `
        INSERT INTO localShipmentLog
        (TrackingId, ClientId, StatusId, ShipmentId, CreatedBy, CreatedAt, isCity, CityId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const insertParams = sanitizeParams([
                TrackingId,
                ClientId,
                statusId,
                shipmentId,
                createdBy,
                createdAt,
                isCity,
                CityId
            ]);

            console.log("✅ Insert Params:", insertParams);

            // 4. Insert log
            await db(insertSql, insertParams);

            insertedLogs.push({ shipmentId, statusId });
        }

        return res.status(200).json({
            success: true,
            message: 'Status logged for shipments (if not duplicate)',
            inserted: insertedLogs
        });

    } catch (error) {
        console.error('Database query error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            detail: error.message
        });
    }
});


// router.post('/tracking', async (req, res) => {
//     const { trackingId } = req.body;
//     if (!trackingId) {
//         return res.status(400).json({ error: 'TrackingId is required' });
//     }
//     try {
//         const sql = `
//             SELECT 
//             l.TrackingId,
//             l.StatusId,
//             CONCAT(
//                 s.StatusName,
//                 IF(l.isCity = 1 AND c.name IS NOT NULL, CONCAT(c.name), '')
//             ) AS StatusName,
//             l.CreatedAt
//             FROM localShipmentLog l
//             LEFT JOIN deliveryStatus s ON l.StatusId = s.Id
//             LEFT JOIN cities c ON l.CityId = c.Id
//             WHERE l.TrackingId = ?
//             ORDER BY l.CreatedAt ASC;`;

//         const history = await db(sql, [trackingId]);

//         if (history.length === 0) {
//             return res.status(404).json({ message: 'No tracking history found.' });
//         }

//         res.status(200).json({
//             success: true,
//             trackingId,
//             history
//         });
//     } catch (error) {
//         console.error('Error fetching tracking history:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// })

router.post('/tracking', async (req, res) => {
    const { trackingId } = req.body;

    if (!trackingId) {
        return res.status(400).json({ error: 'TrackingId is required' });
    }

    try {
        // const sql = `
        //     SELECT 
        //         l.TrackingId,
        //         l.StatusId,
        //         CONCAT(
        //             s.StatusName,
        //             IF(l.isCity = 1 AND c.name IS NOT NULL, CONCAT(' ', c.name), '')
        //         ) AS StatusName,
        //         l.CreatedAt,
        //         ci.FirstName,
        //         ci.LastName,
        //         ci.ContactNo,
        //         ci.Email,
        //         ci.PostalCode,
        //         shi.Description,
        //         shi.Weight,
        //         shi.WeightUnit,
        //         shi.CreatedAt as BookingDate,
        //         CONCAT(users.firstName, ' ', users.lastName) AS ReceivedBy,
        //     FROM localShipmentLog l
        //     LEFT JOIN deliveryStatus s ON l.StatusId = s.Id
        //     LEFT JOIN cities c ON l.CityId = c.Id
        //     INNER JOIN LocalShipmentInformation shi ON l.ShipmentId = shi.Id
        //     INNER JOIN users ON users.id = shi.CreatedBy
        //     INNER JOIN clientInfo ci ON shi.ClientId = ci.Id
        //     WHERE l.TrackingId = ?
        //     ORDER BY l.CreatedAt ASC;
        // `;

        const sql = `
    SELECT 
        l.TrackingId,
        l.StatusId,
        CONCAT(
            s.StatusName,
            IF(l.isCity = 1 AND c.name IS NOT NULL, CONCAT(' ', c.name), '')
        ) AS StatusName,
        l.CreatedAt,
        ci.FirstName,
        ci.LastName,
        ci.ContactNo,
        ci.Email,
        ci.PostalCode,
        shi.Description,
        shi.Weight,
        shi.WeightUnit,
        shi.CreatedAt as BookingDate,
        CONCAT(users.firstName, ' ', users.lastName) AS ReceivedBy
    FROM localShipmentLog l
    LEFT JOIN deliveryStatus s ON l.StatusId = s.Id
    LEFT JOIN cities c ON l.CityId = c.Id
    INNER JOIN LocalShipmentInformation shi ON l.ShipmentId = shi.Id
    INNER JOIN users ON users.id = shi.CreatedBy
    INNER JOIN clientInfo ci ON shi.ClientId = ci.Id
    WHERE l.TrackingId = ?
    ORDER BY l.CreatedAt ASC;
`;

        const history = await db(sql, [trackingId]);

        if (history.length === 0) {
            return res.status(404).json({ message: 'No tracking history found.' });
        }

        res.status(200).json({
            success: true,
            trackingId,
            client: {
                FirstName: history[0].FirstName,
                LastName: history[0].LastName,
                ContactNo: history[0].ContactNo,
                Email: history[0].Email,
                PostalCode: history[0].PostalCode,
            },
            shipment: {
                Description: history[0].Description,
                Weight: history[0].Weight,
                WeightUnit: history[0].WeightUnit,
                BookingDate: history[0].BookingDate,
                ReceivedBy: history[0].ReceivedBy,
            },
            history: history.map(h => ({
                StatusId: h.StatusId,
                StatusName: h.StatusName,
                CreatedAt: h.CreatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching tracking history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;