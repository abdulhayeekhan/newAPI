const express = require('express');
const router = express.Router();
const db = require('../confige/index')
const {getShipments} = require('../controller/shipment/shipment')

router.post('/getAll', async (req, res) => {
    const { startDate, endDate, clientCompanyId, createdBy, companyName , trackingNo ,pageNo, pageSize} = req.body;

    try {
        const shipments = await getShipments({ startDate, endDate, clientCompanyId, createdBy, companyName ,trackingNo, pageNo,pageSize });
        res.status(200).json(shipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
});

router.get('/label/:id', async (req, res) => {
    //const { inquiryNumber } = req.query; // Get parameters from query string
    const trackingId = req.params.id;
    console.log("trackingId", trackingId);
    try {
      const sql = 'SELECT * FROM labels WHERE invoiceId = ?';
      const result = await db(sql, [trackingId]);  // Pass parameters as an array
      if (result.length === 0) {
        return res.status(404).json({ message: 'label not found' });
      }
      res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to label' });
    }
});

module.exports = router;