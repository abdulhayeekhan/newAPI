const express = require('express');
const router = express.Router();
const db = require('../confige/index')
const {GenShipLabelWithUPSAPI} = require('../controller/ups')
const {getOAuthToken} = require('../controller/ups/authentication')
// const {getTrackingDetails} = require('../controller/tracking')
const { trackPackage } = require('../controller/ups/tracking');
const { recoverLabel } = require('../controller/ups/recoverLabel')

const {generateShipmentLabel} = require('../controller/ups/labelGenerate')
const {GenMultiShipLabel} = require('../controller/ups/multiLabel')
const {GenerateInvoice} = require('../controller/invoice')
const {AddConsignee} = require('../controller/consignee')
const {CreateShipment} = require('../controller/shipment')
const {SaveLabel} = require('../controller/savelabel')
const {UpdateCompanyLabelCount} = require('../controller/updateCompanyLabelCount')
router.post('/addShipment', GenShipLabelWithUPSAPI);
router.post('/oauth-token', getOAuthToken);
// router.get('/tracking', getTrackingDetails);

router.get('/tracking/:id', async (req, res) => {
    //const { inquiryNumber } = req.query; // Get parameters from query string
    const token = req.headers['authorization'];
    const inquiryNumber = req.params.id;
    //const token = process.env.UPSTOKEN
    if (!inquiryNumber || !token) {
      return res.status(400).json({ error: 'inquiryNumber and token are required' });
    }
  
    try {
      const trackingData = await trackPackage(inquiryNumber, token);
      res.json(trackingData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to track package' });
    }
});

router.post('/recover-label', async (req, res) => {
    const { trackingNumber } = req.body;
    const token = req.headers['authorization'];
    //const token = req.headers['authorization'];
    if (!token || !trackingNumber) {
      return res.status(400).json({ error: 'token, and trackingNumber are required' });
    }
  
    try {
      const result = await recoverLabel(token, trackingNumber);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to recover label' });
    }
});

router.post('/generate-label', async (req, res) => {
    // const data = req.body;
    const token = req.headers['authorization'];
    const shipmentData = req.body;
    const {shipData,invoiceData} = req.body;
    const cityName = shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City;
    
    // if (!token || !shipper || !shipTo || !shipFrom || !packageDetails) {
    //   return res.status(400).json({ error: 'token, and shipper,shipTo,shipFrom,packageDetails are required' });
    // }
  
    try {
      const result = await generateShipmentLabel(token,shipData,invoiceData);
     
      // await delay(1000);

      // const consigneeInfo = {
      //   clientCompanyId:invoiceData?.clientCompanyId, 
      //   name:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Name, 
      //   companyName:shipData?.ShipmentRequest?.Shipment?.ShipTo?.AttentionName, 
      //   contactNo:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Phone?.Number, 
      //   email:invoiceData?.email, 
      //   countryCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.CountryCode, 
      //   stateCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.StateProvinceCode, 
      //   postalCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.PostalCode,
      //   city:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City, 
      //   address:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.AddressLine
      // }
      // const consigneeResult = await AddConsignee(consigneeInfo);
      
      //await delay(1000);

      // const invoiceInfoData = {
      //   trackingNo:result?.PackageResults[0].TrackingNumber, 
      //   total:0, 
      //   senderId:1, 
      //   consigneeId:consigneeResult?.consigneeId, 
      //   createdBy:invoiceData?.createdBy, 
      //   createdAt:invoiceData?.shipDate, 
      //   details:invoiceData?.Details
      // }
      // const invoiceResult = await GenerateInvoice(invoiceInfoData)
      // console.log('invoiceResult',invoiceResult?.invoiceId);
      // const saveLabel = {
      //   trackingId:result?.PackageResults[0].TrackingNumber,
      //   graphicImage:result?.PackageResults[0].ShippingLabel?.GraphicImage,
      //   createdBy:invoiceData?.createdBy
      // }
      //save label graphic in database
      // await SaveLabel(saveLabel)

      // // await delay(1000);

      // // update company label count
      // await UpdateCompanyLabelCount(invoiceData?.clientCompanyId)

      // // await delay(1000);
      // const shipmentInfoData = {
      //   trackingNo:result?.PackageResults[0].TrackingNumber,
      //   invoiceNo:invoiceResult?.invoiceId,
      //   carrierCode:'UPS',
      //   SenderId:1,
      //   weightUnit:result?.BillingWeight?.UnitOfMeasurement?.Code,
      //   weight:result?.BillingWeight?.Weight,
      //   dimensionUnit:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.UnitOfMeasurement?.Code,
      //   lenght:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Length,
      //   width:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Width,
      //   height:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Height,
      //   currency:result?.ShipmentCharges?.TotalCharges?.CurrencyCode,
      //   total:result?.ShipmentCharges?.TotalCharges?.MonetaryValue,
      //   customerReference:'',
      //   shipDate:invoiceData?.shipDate,
      //   createdBy:invoiceData?.createdBy,
      //   clientCompanyId:invoiceData?.clientCompanyId,
      //   consigneeId:consigneeResult?.consigneeId
      // }
      
      // const shipmentResult = await CreateShipment(shipmentInfoData);
      // await delay(1000);
      console.log("result:",result)
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate label' });
    }
});

router.post('/generate-multi-label', async (req, res) => {
  const token = req.headers['authorization'];
  const shipmentData = req.body;
  const {shipData,invoiceData} = req.body;
  
  try {
    const result = await GenMultiShipLabel(token,shipData,invoiceData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate label' });
  }
});


router.post('/generate-invoice', async (req, res) => {
  // const data = req.body;
  const invoiceData = req.body;
  // if (!token || !shipper || !shipTo || !shipFrom || !packageDetails) {
  //   return res.status(400).json({ error: 'token, and shipper,shipTo,shipFrom,packageDetails are required' });
  // }

  try {
    const result = await GenerateInvoice(invoiceData);
    
    //console.log('tracking',result[0].TrackingNumber)
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

router.post('/add-consignee', async (req, res) => {
  // const data = req.body;
  const consigneeeData = req.body;
  // if (!token || !shipper || !shipTo || !shipFrom || !packageDetails) {
  //   return res.status(400).json({ error: 'token, and shipper,shipTo,shipFrom,packageDetails are required' });
  // }

  try {
    const result = await AddConsignee(consigneeeData);
    
    //console.log('tracking',result[0].TrackingNumber)
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

router.post('/add-shipment', async (req, res) => {
  // const data = req.body;
  const shipeData = req.body;
  // if (!token || !shipper || !shipTo || !shipFrom || !packageDetails) {
  //   return res.status(400).json({ error: 'token, and shipper,shipTo,shipFrom,packageDetails are required' });
  // }

  try {
    const result = await CreateShipment(shipeData);
    
    //console.log('tracking',result[0].TrackingNumber)
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});


router.get('/invoice/:id', async (req, res) => {
  // const data = req.body;
  const invoiceId = req.params.id;
  // try {
  //   const result = await AddConsignee(consigneeeData);
    
  //   //console.log('tracking',result[0].TrackingNumber)
  //   res.json(result);
  // } catch (error) {
  //   console.log(error)
  //   res.status(500).json({ error: 'Failed to generate invoice' });
  // }
  // try {
  //   // SQL query to join invoice and invoicedetail tables
  //     const sql = `
  //         SELECT 
  //             i.id AS invoiceId,
  //             i.trackingNo,
  //             i.total,
  //             i.senderId,
  //             i.consigneeId,
  //             i.createdBy,
  //             i.createdAt,
  //             i.invoiceId AS customInvoiceId,
  //             d.id AS detailId,
  //             d.description,
  //             d.Qty,
  //             d.unitPrice,
  //             d.HtsCode,
  //             d.totalPrice
  //         FROM invoice i
  //         LEFT JOIN invoicedetail d ON i.id = d.invoiceId
  //         WHERE i.id = [?]
  //         ORDER BY i.id;
  //     `;

  //     // Execute the query
  //     const [rows] = await db.execute(sql,[invoiceId]);

  //     // Process results into a nested structure
  //     const invoices = rows.reduce((acc, row) => {
  //         // Check if the invoice is already in the accumulator
  //         let invoice = acc.find(i => i.invoiceId === row.invoiceId);

  //         if (!invoice) {
  //             // If not, add the invoice with empty details array
  //             invoice = {
  //                 invoiceId: row.invoiceId,
  //                 trackingNo: row.trackingNo,
  //                 total: row.total,
  //                 senderId: row.senderId,
  //                 consigneeId: row.consigneeId,
  //                 createdBy: row.createdBy,
  //                 createdAt: row.createdAt,
  //                 customInvoiceId: row.customInvoiceId,
  //                 details: []
  //             };
  //             acc.push(invoice);
  //         }

  //         // Add detail if it exists
  //         if (row.detailId) {
  //             invoice.details.push({
  //                 detailId: row.detailId,
  //                 description: row.description,
  //                 Qty: row.Qty,
  //                 unitPrice: row.unitPrice,
  //                 HtsCode: row.HtsCode,
  //                 totalPrice: row.totalPrice
  //             });
  //         }

  //         return acc;
  //     }, []);

  //     // Send the response
  //     res.status(200).json({ success: true, data: invoices });
  // } catch (error) {
  //     console.error('Error fetching invoices with details:', error);
  //     res.status(500).json({ success: false, message: 'Failed to fetch invoices', error });
  // }
  // try {
  //     const sql = `
  //         SELECT 
  //             i.id AS invoiceId,
  //             i.invoiceId AS invoiceNo,
  //             i.senderId,
  //             i.trackingNo,
  //             i.createdBy,
  //             i.createdAt,
  //             id.id AS detailId,
  //             id.description,
  //             id.Qty,
  //             id.unitPrice,
  //             id.HtsCode
  //         FROM invoice i
  //         LEFT JOIN invoicedetail id ON i.id = id.invoiceId
  //         WHERE id.invoiceId = ?
  //         ORDER BY i.id, id.id;
  //     `;

  //     const [rows] = await db(sql,[invoiceId]);
  //     console.log('Rows:', rows);
  //     // Transform data into a nested structure
  //     const result = rows.reduce((acc, row) => {
  //         const {
  //             invoiceId, invoiceNo, createdAt, senderId, createdBy,trackingNo,
  //             detailId, description, Qty, unitPrice, HtsCode
  //         } = row;

  //         // Find or create the invoice
  //         let invoice = acc.find(inv => inv.invoiceId === invoiceId);
  //         if (!invoice) {
  //             invoice = {
  //                 invoiceId,
  //                 invoiceNo,
  //                 trackingNo,
  //                 createdAt,
  //                 senderId,
  //                 createdBy,
  //                 details: [] // To store details
  //             };
  //             acc.push(invoice);
  //         }

  //         // Add detail if exists
  //         if (detailId) {
  //             invoice.details.push({
  //               detailId,
  //               description,
  //               Qty,
  //               unitPrice,
  //               HtsCode
  //             });
  //         }

  //         return acc;
  //     }, []);

  //     res.json(result);
  // } catch (error) {
  //     console.error('Error fetching invoices:', error);
  //     res.status(500).send('Internal Server Error');
  // }

  try {
    // Get invoice data
    const invoiceRows = await db('SELECT * FROM invoice as inv INNER JOIN consignee as con ON con.id = inv.consigneeId WHERE inv.id = ?', [invoiceId]);
    
    if (invoiceRows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoiceData = invoiceRows[0];

    // Get invoice details
    const detailsRows = await db('SELECT * FROM invoicedetail WHERE invoiceId = ?', [invoiceId]);
    console.log('Invoice Data:', invoiceData);
    console.log('Details Data:', detailsRows);
    // Combine the data
    const result = {
      ...invoiceData,
      details: detailsRows
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;