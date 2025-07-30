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

router.get('/getShipmentShortStatus', async (req, res) => {
    const IsForUK = req.query.IsForUK ?? 0;

    const query = `
        SELECT Id, shortName AS StatusName, IsForUK, SortOrder 
        FROM deliveryStatus 
        WHERE isShortStatus = 1 
          AND (IsForUK = ? OR (IsForUK IS NULL AND isActive = 1)) 
        ORDER BY SortOrder ASC
    `;
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


router.get('/GetSingleShipmentInformation', async (req, res) => {
    const ShipmentId = req.query.ShipmentId;

    const query = `
    SELECT
      s.id AS ShipmentId,
      s.TrackingId,
      s.Weight,
      s.WeightUnit,
      s.BookingCityId,
      s.IsForUK,
      s.FreightAmountPKR,
      s.ValuePKR,
      s.NoOfPcs,
      s.createdAt AS BookingDate,
      s.deliveryStatusId,

      -- Client Info
      c.FirstName,
      c.LastName,
      c.CNIC,
      c.ContactNo AS ClientContact,
      c.Email AS ClientEmail,
      c.PostalCode,
      c.Address AS ClientAddress,

      -- Consignee Info
      cons.Name AS ConsigneeName,
      cons.Address AS ConsigneeAddress,
      cons.CountryId AS ConsigneeCountryId,
      cons.ZipCode AS ConsigneeZip,
      cons.ContactNo AS ConsigneeContact,

      -- Created By User
      us.firstName AS CreatedByFirstName,
      us.lastName AS CreatedByLastName,
      CONCAT(us.firstName, ' ', us.lastName) AS CreatedByName,
      
      -- Shipment Details
      d.Description,
      d.Quantity

    FROM LocalShipmentInformation s
    JOIN users us ON s.CreatedBy = us.id
    JOIN clientInfo c ON s.ClientId = c.id
    JOIN consigneeInfo cons ON s.consigneeInfoId = cons.id
    LEFT JOIN localShipmentDetails d ON s.id = d.ShipmentId
    WHERE s.id = ?
  `;

    try {
        const result = await db(query, [ShipmentId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Optional: group details if there are multiple items
        const shipmentInfo = {
            ...result[0],
            shipmentDetails: result.map(r => ({
                Description: r.Description,
                Quantity: r.Quantity
            }))
        };

        // Remove duplicate flat detail fields if needed
        delete shipmentInfo.Description;
        delete shipmentInfo.Quantity;

        res.json(shipmentInfo);
    } catch (error) {
        console.error('Error fetching shipment:', error);
        res.status(500).send('Error fetching shipment');
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
        Address,
        CountryId = 178,
        StateId = 72,
        CityId,
        CreatedBy,
        ModifiedBy,
        Weight,
        WeightUnit,
        BookingCityId,
        IsForUK,
        FreightAmountPKR,
        ValuePKR,
        ConsignName,
        ConsignAddress,
        ConsignCountryId,
        ConsignZipCode,
        ConsignContactNo,
        NoOfPcs,
        ShipmentDetails,
        ShipmentStatus = 1
    } = req.body;

    //ShipmentDetails:{Description:'', Quantity:''}

    const createdAtPKT = moment().tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');

    try {
        // 1. Insert into clientInfo
        const sql1 = `
            INSERT INTO clientInfo (
                FirstName, LastName, CNIC, ContactNo, Email, PostalCode, Address,
                CountryId, StateId, CityId
                , CreatedBy, ModifiedBy
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result1 = await db(sql1, [
            FirstName, LastName, CNIC, ContactNo, Email, PostalCode, Address,
            CountryId, StateId, CityId, CreatedBy, ModifiedBy
        ]);

        const clientId = result1.insertId;



        const sql4 = `
            INSERT INTO consigneeInfo 
            (Name, Address, CountryId, ZipCode, ContactNo) 
            VALUES (?, ?, ?, ?, ?)
        `
        const result4 = await db(sql4, [
            ConsignName, ConsignAddress, ConsignCountryId, ConsignZipCode, ConsignContactNo
        ])
        const consigneeInfoId = result4.insertId;


        // 2. Generate Tracking ID
        const trackingId = 'THC' + Math.floor(1000000 + Math.random() * 9000000);

        // 3. Insert into LocalShipmentInformation
        const sql2 = `
            INSERT INTO LocalShipmentInformation (
                TrackingId, ClientId, Weight, WeightUnit,
                BookingCityId, IsForUK, CreatedBy, FreightAmountPKR, ValuePKR, consigneeInfoId,NoOfPcs
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
        const result2 = await db(sql2, [
            trackingId, clientId, Weight, WeightUnit,
            BookingCityId, IsForUK, CreatedBy, FreightAmountPKR, ValuePKR, consigneeInfoId, NoOfPcs
        ]);

        const shipmentId = result2.insertId

        // Insert multiple localShipmentDetails


        await Promise.all(ShipmentDetails.map(({ Description, Quantity }) => {
            const detailSql = `
                INSERT INTO localShipmentDetails (Description, Quantity, ShipmentId)
                VALUES (?, ?, ?)
            `;
            return db(detailSql, [Description, Quantity, shipmentId]);
        }));


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
            trackingId,
            shipmentId
        });
    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({ success: false, error: 'Insert failed' });
    }
});



router.post('/UpdateShipmentStatus', async (req, res) => {
    const { shipmentIds, statusId, createdBy } = req.body;
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

            // 5. Update DeliveryStatusId in LocalShipmentInformation
            const updateSql = `
                UPDATE LocalShipmentInformation
                SET deliveryStatusId = ?
                WHERE Id = ?
                `;
            await db(updateSql, [statusId, shipmentId]);


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


router.post('/GetTrackings', async (req, res) => {
    try {
        // Pagination
        const pageNo = parseInt(req.body.pageNo) || 1;
        const pageSize = parseInt(req.body.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        // Optional filters
        const { createdBy, trackingId, deliveryStatusId, IsforUK } = req.body;

        // Build WHERE clause dynamically
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (createdBy && trackingId.trim() !== '') {
            whereClause += ' AND si.CreatedBy = ?';
            params.push(createdBy);
        }

        

        if (trackingId && trackingId.trim() !== '') {
            whereClause += ' AND si.TrackingId = ?';
            params.push(trackingId);
        }

        if (deliveryStatusId && deliveryStatusId !== '') {
            whereClause += ' AND si.deliveryStatusId = ?';
            params.push(deliveryStatusId);
        }

        if (typeof IsforUK === 'boolean') {
            whereClause += ' AND si.IsforUK = ?';
            params.push(IsforUK ? 1 : 0);
        }

        // Total count query
        //const countSql = `SELECT COUNT(*) AS totalCount FROM LocalShipmentInformation ${whereClause}`;
        const countSql = `SELECT COUNT(*) AS totalCount FROM LocalShipmentInformation AS si ${whereClause}`;

        const [countResult] = await db(countSql, params);
        const totalCount = countResult?.totalCount || 0;

        // Data query with LIMIT and OFFSET
        const dataSql = `
            SELECT 
                si.Id, si.TrackingId, si.CreatedBy, si.Weight, si.WeightUnit,
                si.deliveryStatusId,ds.StatusName, si.CreatedAt,si.IsforUK , city.name as BookingCity, 
                ci.FirstName, ci.LastName, ci.CNIC, ci.ContactNo, ci.Email, ci.PostalCode
            FROM LocalShipmentInformation as si
            INNER JOIN clientInfo as ci ON ci.Id = si.ClientId
            INNER JOIN cities as city ON city.id = si.BookingCityId
            INNER JOIN deliveryStatus as ds ON ds.Id = si.deliveryStatusId
            ${whereClause}
            ORDER BY si.CreatedAt DESC
            LIMIT ? OFFSET ?
            `;

        const dataParams = [...params, pageSize, offset];
        const shipments = await db(dataSql, dataParams);

        return res.status(200).json({
            success: true,
            data: shipments,
            totalCount,
            currentPage: pageNo,
            pageSize
        });

    } catch (error) {
        console.error('Error fetching shipments:', error);
        return res.status(500).json({
            success: false,
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
        ci.name as BookingCity,
        shi.Weight,
        shi.WeightUnit,
        shi.CreatedAt as BookingDate,
        shi.isForUK,
        shi.NoOfPcs,
        CONCAT(users.firstName, ' ', users.lastName) AS ReceivedBy
    FROM localShipmentLog l
    LEFT JOIN deliveryStatus s ON l.StatusId = s.Id
    LEFT JOIN cities c ON l.CityId = c.Id
    LEFT JOIN cities ci ON shi.BookingCityId = ci.Id
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
                Weight: history[0].Weight,
                WeightUnit: history[0].WeightUnit,
                BookingDate: history[0].BookingDate,
                IsForUK: history[0].isForUK,
                NoOfPcs: history[0].NoOfPcs,
                ReceivedBy: history[0].ReceivedBy,
                BookingCity: history[0].BookingCity
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