const express = require('express');
const axios = require('axios');
const app = express();
const db = require('../../confige/index')
const fs = require('fs');
const crypto = require('crypto');
// Middleware to parse JSON bodies
app.use(express.json());
const UPS_API_URL = process.env.UPS_API_URL

//   try {
//     if (!req.body || !req.body.shipper || !req.body.shipTo || !req.body.shipFrom || !req.body.packageDetails) {
//         return res.status(400).json({ message: 'Missing required fields in request body' });
//     }
//     // Extracting user input data from the request body
//     const {
//       shipper,
//       shipTo,
//       shipFrom,
//       packageDetails,
//       labelSpecification,
//       token,
//     } = req.body;

//     // Construct the query string
//     const query = new URLSearchParams({
//       additionaladdressvalidation: 'string',
//     }).toString();

//     // Making the API request to UPS
//     const response = await axios.post(
//       `https://wwwcie.ups.com/api/shipments/v1/ship?${query}`,
//       {
//         ShipmentRequest: {
//           Request: {
//             SubVersion: '1801',
//             RequestOption: 'nonvalidate',
//             TransactionReference: { CustomerContext: '' }
//           },
//           Shipment: {
//             Description: 'Ship WS test',
//             Shipper: shipper,  // User-provided data
//             ShipTo: shipTo,    // User-provided data
//             ShipFrom: shipFrom,  // User-provided data
//             PaymentInformation: {
//               ShipmentCharge: {
//                 Type: '01',
//                 BillShipper: { AccountNumber: ' ' },
//               }
//             },
//             Service: {
//               Code: '03',
//               Description: 'Express',
//             },
//             Package: packageDetails,  // User-provided package details
//           },
//           LabelSpecification: labelSpecification || {
//             LabelImageFormat: {
//               Code: 'GIF',
//               Description: 'GIF',
//             },
//             HTTPUserAgent: 'Mozilla/4.5',
//           }, // Default label specification if none provided
//         },
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           transId: 'string',
//           transactionSrc: 'testing',
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     // Log and send the response data back to the client
//     console.log(response.data);
//     res.status(200).json(response.data);  // Sending response to the client
//   } catch (error) {
//     console.error('Error generating shipment label:', error);
//     res.status(500).json({ message: 'Error generating shipment label', error: error.message });
//   }
// };

const generateShipmentLabel = async (token,shipData,invoiceData) => {
  const shipmentData = shipData;
  console.log("shipmentData", shipmentData);
    try {
      const cityName = shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City;
      const CustomerContext = shipData?.ShipmentRequest?.Request?.TransactionReference?.CustomerContext;
      const query = new URLSearchParams({
        additionaladdressvalidation: cityName,
      }).toString();
      
      
      const response = await axios.post(
        `${UPS_API_URL}/api/shipments/v2409/ship?${query}`,
        shipmentData
        ,
        {
          headers: {
            'Content-Type': 'application/json',
            transId: 'string',
            transactionSrc: 'testing',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let result = response?.data?.ShipmentResponse?.ShipmentResults;
      if(response?.status === "200" || response?.status === 200){
        const consigneeInfo = {
          clientCompanyId:invoiceData?.clientCompanyId, 
          name:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Name, 
          companyName:shipData?.ShipmentRequest?.Shipment?.ShipTo?.AttentionName, 
          contactNo:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Phone?.Number, 
          email:invoiceData?.email, 
          countryCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.CountryCode, 
          stateCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.StateProvinceCode, 
          postalCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.PostalCode,
          city:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City, 
          address:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.AddressLine[0]
        }
        console.log("consigneeInfo:",consigneeInfo)
        const checkSql = `
        SELECT * 
        FROM consignee 
        WHERE clientCompanyId = ? 
            AND (contactNo = ? OR email = ?)
        `;
        const existingRecords = await db(checkSql, [consigneeInfo?.clientCompanyId, consigneeInfo?.contactNo, consigneeInfo?.email]);
        let consigneeId = ""
        if (existingRecords.length > 0) {
        // If a record exists, return an error or a message
            const updateSql = `
                UPDATE consignee
                SET name = ?, companyName = ?, countryCode = ?, stateCode = ?,postalCode = ?, city = ?, address = ?
                WHERE id = ?
            `;
            await db(updateSql, [
                consigneeInfo?.name,
                consigneeInfo?.companyName,
                consigneeInfo?.countryCode,
                consigneeInfo?.stateCode,
                consigneeInfo?.postalCode,
                consigneeInfo?.city,
                consigneeInfo?.address,
                existingRecords[0].id,
            ]);
            consigneeId =  existingRecords[0].id;
        }
       
        if (!consigneeInfo?.clientCompanyId || !consigneeInfo?.name || !consigneeInfo?.companyName || !consigneeInfo?.contactNo || !consigneeInfo?.email || !consigneeInfo?.countryCode || !consigneeInfo?.stateCode || !consigneeInfo?.postalCode || !consigneeInfo?.city || !consigneeInfo?.address) {
          throw new Error("Missing required values for insertion.");
        }
        console.log("consigneeInfo:", consigneeInfo);
        const sqlCong = `INSERT INTO consignee (clientCompanyId, name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const resultCons = await db(sqlCong, [consigneeInfo?.clientCompanyId,  consigneeInfo?.name, consigneeInfo?.companyName, consigneeInfo?.contactNo, consigneeInfo?.email, consigneeInfo?.countryCode, consigneeInfo?.stateCode,consigneeInfo?.postalCode, consigneeInfo?.city, consigneeInfo?.address]);
            consigneeId = resultCons.insertId;
        if(consigneeId !== "" || consigneeId !== null){
          const invoiceIdData = CustomerContext;
          let invoiceInfoData = {
            trackingNo:result?.PackageResults[0].TrackingNumber, 
            total:0, 
            senderId:1, 
            consigneeId:consigneeId, 
            createdBy:invoiceData?.createdBy,
            invoiceId:invoiceIdData,
            createdAt:invoiceData?.shipDate, 
            details:invoiceData?.Details
          }

          const detailsContent = invoiceInfoData.details.map(detail => {
            return `Description: ${detail.description}, HtsCode: ${detail.HtsCode}, Unit Price: ${detail.unitPrice}, Quantity: ${detail.Qty}, Total : ${detail.Qty*detail.unitPrice}`;
          }).join('\n'); // Join each detail with a newline

          const totalPrice = invoiceInfoData.details?.reduce(
            (sum, item) => sum + (item.unitPrice * item.Qty || 0),
            0
          );

          const textContent = `Tracking Number: ${invoiceInfoData.trackingNo}
          Total: ${totalPrice}
          SENDER: ESCM GMBH
          SENDER ADDRESS: Koln, Germany 50829
          SENDER PHONE: 0049-15202446893
          SENDER COUNTRY: Germany
          CONSIGNEE : ${consigneeInfo?.name}
          CONSIGNEE ADDRESS: ${consigneeInfo?.address} ${consigneeInfo?.city}, ${consigneeInfo?.stateCode} ${consigneeInfo?.postalCode} ${consigneeInfo?.countryCode}
          CONSIGNEE PHONE: ${consigneeInfo?.contactNo}
          CONSIGNEE COUNTRY: ${consigneeInfo?.countryCode}
          DETAILS: ${detailsContent}
          `;

          // Write it to a text file
          fs.writeFileSync('docFile.txt', textContent);

          const filePath = 'docFile.txt';
          const fileContent = fs.readFileSync(filePath);
          const base64File = fileContent.toString('base64');

          const paperless_res = await axios.post(
            `${UPS_API_URL}/api/paperlessdocuments/v1/upload`,
            {
              UploadRequest: {
                Request: {
                  TransactionReference: {
                    CustomerContext: CustomerContext
                  }
                },
                UserCreatedForm: {
                  UserCreatedFormFileName: filePath,
                  UserCreatedFormFileFormat: 'txt',
                  UserCreatedFormDocumentType: '013',
                  UserCreatedFormFile: base64File
                }
              }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                transId: 'string',
                transactionSrc: 'testing',
                ShipperNumber: 'A70C63',
                Authorization: `Bearer ${token}`
              }
            }
          );

            const sql = `INSERT INTO invoice (trackingNo, total, senderId, consigneeId,invoiceId, createdBy) 
                    VALUES (?, ?, ?, ?, ?,?)`;

                    // Use your db function to execute the query
            const resultInvoice = await db(sql, [invoiceInfoData?.trackingNo, invoiceInfoData?.total, invoiceInfoData?.senderId, invoiceInfoData?.consigneeId,invoiceInfoData?.invoiceId, invoiceInfoData?.createdBy]);
            let insertedInvoiceId = resultInvoice.insertId;
            const detailsQuery = `
              INSERT INTO invoicedetail (invoiceId, description, Qty, unitPrice, HtsCode, totalPrice)
              VALUES ${invoiceInfoData?.details.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`;

            const detailValues = invoiceInfoData?.details.flatMap(d => [
              insertedInvoiceId,  // Use the newly inserted invoiceId
              d.description,
              d.Qty,
              d.unitPrice,
              d.HtsCode,
              d.totalPrice,
            ]);
            await db(detailsQuery, detailValues);  
            const invoiceId = insertedInvoiceId;
            if(invoiceId !== ''){
              const saveLabel = {
                trackingId:result?.PackageResults[0].TrackingNumber,
                graphicImage:result?.PackageResults[0].ShippingLabel?.GraphicImage,
                createdBy:invoiceData?.createdBy
              }
              const sql = `
                    INSERT INTO labels (trackingId, graphicImage, invoiceId, createdBy)
                    VALUES (?, ?, ?, ?)`;
                    // Use your db function to execute the query
              const resultLabel = await db(sql, [saveLabel?.trackingId, saveLabel?.graphicImage, invoiceId, saveLabel?.createdBy]);
              if(resultLabel.insertId !==""){
                const sql = "UPDATE company SET labelCount = labelCount - 1 WHERE id = ? AND labelCount > 0";
                const resultUpdate = await db(sql, [invoiceData?.clientCompanyId]);
                if(resultUpdate !== ""){
          
                  const shipmentInfoData = {
                    trackingNo:result?.PackageResults[0].TrackingNumber,
                    invoiceNo:invoiceId,
                    carrierCode:'UPS',
                    SenderId:1,
                    weightUnit:result?.BillingWeight?.UnitOfMeasurement?.Code,
                    weight:result?.BillingWeight?.Weight,
                    dimensionUnit:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.UnitOfMeasurement?.Code,
                    lenght:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Length,
                    width:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Width,
                    height:shipData?.ShipmentRequest?.Shipment?.Package?.Dimensions?.Height,
                    currency:result?.ShipmentCharges?.TotalCharges?.CurrencyCode,
                    total:result?.ShipmentCharges?.TotalCharges?.MonetaryValue,
                    customerReference:shipData?.ShipmentRequest.Shipment.Description,
                    shipDate:invoiceData?.shipDate,
                    createdBy:invoiceData?.createdBy,
                    clientCompanyId:invoiceData?.clientCompanyId,
                    consigneeId:consigneeId
                  }

                  const sql = `
                    INSERT INTO shipment (trackingNo,invoiceNo,carrierCode, SenderId, weightUnit, weight, dimensionUnit, lenght, width, height, currency, total, customerReference, shipDate, createdBy, clientCompanyId, consigneeId) 
                    VALUES (?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)`;

                    // Use your db function to execute the query
                    const resultShipment = await db(sql, [shipmentInfoData?.trackingNo,shipmentInfoData?.invoiceNo,shipmentInfoData?.carrierCode, shipmentInfoData?.SenderId, shipmentInfoData?.weightUnit, shipmentInfoData?.weight, shipmentInfoData?.dimensionUnit, shipmentInfoData?.lenght, shipmentInfoData?.width, shipmentInfoData?.height, shipmentInfoData?.currency, shipmentInfoData?.total, shipmentInfoData?.customerReference, shipmentInfoData?.shipDate, shipmentInfoData?.createdBy, shipmentInfoData?.clientCompanyId, shipmentInfoData?.consigneeId]);
                    const ShipinsertedId = resultShipment.insertId;
                    return { 
                        message:"Shipment Create and Label Generete Succfully" , 
                        data:{
                            id:ShipinsertedId,
                            trackingNo:shipmentInfoData?.trackingNo,
                            invoiceNo:shipmentInfoData?.invoiceNo,
                            carrierCode:shipmentInfoData?.carrierCode,
                            SenderId:shipmentInfoData?.SenderId,
                            weightUnit:shipmentInfoData?.weightUnit,
                            weight:shipmentInfoData?.weight,
                            dimensionUnit:shipmentInfoData?.dimensionUnit,
                            lenght:shipmentInfoData?.lenght,
                            width:shipmentInfoData?.width,
                            height:shipmentInfoData?.height,
                            currency:shipmentInfoData?.currency,
                            total:shipmentInfoData?.total,
                            customerReference:shipmentInfoData?.customerReference,
                            shipDate:shipmentInfoData?.shipDate,
                            createdBy:shipmentInfoData?.createdBy,
                            clientCompanyId:shipmentInfoData?.clientCompanyId,
                            consigneeId:shipmentInfoData?.consigneeId
                        } 
                    };
                }
              }
              
            }
        }
      }
      return response?.data?.ShipmentResponse?.ShipmentResults;
    } catch (error) {
      console.error('Error generating shipment label:', error);
      return res.status(500).json({ message: 'Error generating shipment label', error: error.message });
    }
  };

module.exports = { generateShipmentLabel };