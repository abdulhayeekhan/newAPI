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

// const GenMultiShipLabel = async (token,shipData,invoiceData) => {
//   const shipmentData = shipData;
//     try {
//       const cityName = shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City;
     
//       const query = new URLSearchParams({
//         additionaladdressvalidation: cityName,
//       }).toString();
      
      
//       const response = await axios.post(
//         `${UPS_API_URL}/api/shipments/v2409/ship?${query}`,
//         shipmentData
//         ,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             transId: 'string',
//             transactionSrc: 'testing',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       let result = response?.data?.ShipmentResponse?.ShipmentResults;
//       console.log("result:",result?.PackageResults)
//       if(response?.status === "200" || response?.status === 200){
//         const consigneeInfo = {
//           clientCompanyId:invoiceData?.clientCompanyId, 
//           name:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Name, 
//           companyName:shipData?.ShipmentRequest?.Shipment?.ShipTo?.AttentionName, 
//           contactNo:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Phone?.Number, 
//           email:invoiceData?.email, 
//           countryCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.CountryCode, 
//           stateCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.StateProvinceCode, 
//           postalCode:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.PostalCode,
//           city:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City, 
//           address:shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.AddressLine[0]
//         }
//         // console.log("consigneeInfo:",consigneeInfo)
//         const checkSql = `
//         SELECT * 
//         FROM consignee 
//         WHERE clientCompanyId = ? 
//             AND (contactNo = ? OR email = ?)
//         `;
//         const existingRecords = await db(checkSql, [consigneeInfo?.clientCompanyId, consigneeInfo?.contactNo, consigneeInfo?.email]);
//         let consigneeId = ""
//         if (existingRecords.length > 0) {
//         // If a record exists, return an error or a message
//             const updateSql = `
//                 UPDATE consignee
//                 SET name = ?, companyName = ?, countryCode = ?, stateCode = ?,postalCode = ?, city = ?, address = ?
//                 WHERE id = ?
//             `;
//             await db(updateSql, [
//                 consigneeInfo?.name,
//                 consigneeInfo?.companyName,
//                 consigneeInfo?.countryCode,
//                 consigneeInfo?.stateCode,
//                 consigneeInfo?.postalCode,
//                 consigneeInfo?.city,
//                 consigneeInfo?.address,
//                 existingRecords[0].id,
//             ]);
//             consigneeId =  existingRecords[0].id;
//         }
       
//         if (!consigneeInfo?.clientCompanyId || !consigneeInfo?.name || !consigneeInfo?.companyName || !consigneeInfo?.contactNo || !consigneeInfo?.email || !consigneeInfo?.countryCode || !consigneeInfo?.stateCode || !consigneeInfo?.postalCode || !consigneeInfo?.city || !consigneeInfo?.address) {
//           throw new Error("Missing required values for insertion.");
//         }

//         const sqlCong = `INSERT INTO consignee (clientCompanyId, name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//             const resultCons = await db(sqlCong, [consigneeInfo?.clientCompanyId,  consigneeInfo?.name, consigneeInfo?.companyName, consigneeInfo?.contactNo, consigneeInfo?.email, consigneeInfo?.countryCode, consigneeInfo?.stateCode,consigneeInfo?.postalCode, consigneeInfo?.city, consigneeInfo?.address]);
//             consigneeId = resultCons.insertId;
//         if(consigneeId !== "" || consigneeId !== null){
//             // console.log("consigneeId: => ",consigneeId)
//           const invoiceIdData = crypto.randomBytes(5).toString('hex').slice(0, 10);
//           let invoiceInfoData = {
//             trackingNo:result?.PackageResults[0].TrackingNumber, 
//             total:0, 
//             senderId:1, 
//             consigneeId:consigneeId, 
//             createdBy:invoiceData?.createdBy,
//             invoiceId:invoiceIdData,
//             createdAt:invoiceData?.shipDate, 
//             details:invoiceData?.Details
//           }

//             const sql = `INSERT INTO invoice (trackingNo, total, senderId, consigneeId,invoiceId, createdBy) 
//                     VALUES (?, ?, ?, ?, ?,?)`;

//                     // Use your db function to execute the query
//             const resultInvoice = await db(sql, [invoiceInfoData?.trackingNo, invoiceInfoData?.total, invoiceInfoData?.senderId, invoiceInfoData?.consigneeId,invoiceInfoData?.invoiceId, invoiceInfoData?.createdBy]);
//             let insertedInvoiceId = resultInvoice.insertId;
//             const detailsQuery = `
//               INSERT INTO invoicedetail (invoiceId, description, Qty, unitPrice, HtsCode, totalPrice)
//               VALUES ${invoiceInfoData?.details.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`;

//             const detailValues = invoiceInfoData?.details.flatMap(d => [
//               insertedInvoiceId,  // Use the newly inserted invoiceId
//               d.description,
//               d.Qty,
//               d.unitPrice,
//               d.HtsCode,
//               d.totalPrice,
//             ]);
//             await db(detailsQuery, detailValues);  

//             const invoiceId = insertedInvoiceId;
//             // console.log("invoiceId => ",invoiceId)
//             if(invoiceId !== ''){
//                 const labelsdat = result?.PackageResults
//                 // console.log("labelsdat=>",labelsdat)
//                 const saveLabel = {
//                     trackingId:result?.PackageResults[0].TrackingNumber,
//                     graphicImage:result?.PackageResults[0].ShippingLabel?.GraphicImage,
//                     createdBy:invoiceData?.createdBy
//                 }
               
//               const sql = `
//                     INSERT INTO labels (trackingId, graphicImage, invoiceId, createdBy) 
//                     VALUES ${labelsdat?.map(() => '(?, ?, ?, ?)').join(', ')}`;
//                     // Use your db function to execute the query
//                 let createdID = invoiceData?.createdBy
//                 const labelsDetail = labelsdat?.flatMap(d => [
//                     d.TrackingNumber,
//                     d.ShippingLabel?.GraphicImage,
//                     invoiceId,
//                     createdID,
//                 ]);
//                 // console.log("labelsDetail:=>",labelsDetail)
//               const resultLabel = await db(sql, labelsDetail);
//               if(resultLabel.insertId !==""){
//                 const sql = "UPDATE company SET labelCount = labelCount - 1 WHERE id = ? AND labelCount > 0";
//                 const resultUpdate = await db(sql, [invoiceData?.clientCompanyId]);
//                 if(resultUpdate !== ""){
//                     let lenght = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
//                         (sum, item) => sum + (Number(item.Dimensions?.Length) || 0),
//                         0
//                     )
//                     let width = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
//                         (sum, item) => sum + (Number(item.Dimensions?.Width) || 0),
//                         0
//                     )
//                     let height = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
//                         (sum, item) => sum + (Number(item.Dimensions?.Height) || 0),
//                         0
//                     )
           
//                   const shipmentInfoData = {
//                     trackingNo:result?.PackageResults[0].TrackingNumber,
//                     invoiceNo:invoiceId,
//                     carrierCode:'UPS',
//                     SenderId:1,
//                     weightUnit:result?.BillingWeight?.UnitOfMeasurement?.Code,
//                     weight:result?.BillingWeight?.Weight,
//                     height:height,
//                     width:width,
//                     lenght:lenght,
//                     dimensionUnit:shipData?.ShipmentRequest?.Shipment?.Package[0]?.Dimensions?.UnitOfMeasurement?.Code,
//                     currency:result?.ShipmentCharges?.TotalCharges?.CurrencyCode,
//                     total:result?.ShipmentCharges?.TotalCharges?.MonetaryValue,
//                     customerReference:'',
//                     shipDate:invoiceData?.shipDate,
//                     createdBy:invoiceData?.createdBy,
//                     clientCompanyId:invoiceData?.clientCompanyId,
//                     consigneeId:consigneeId
//                   }
//                   console.log("shipmentInfoData:=>",shipmentInfoData)
//                   const sql = `
//                     INSERT INTO shipment (trackingNo,invoiceNo,carrierCode, SenderId, weightUnit, weight, dimensionUnit, lenght, width, height, currency, total, customerReference, shipDate, createdBy, clientCompanyId, consigneeId) 
//                     VALUES (?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)`;

//                     // Use your db function to execute the query
//                     const resultShipment = await db(sql, [shipmentInfoData?.trackingNo,shipmentInfoData?.invoiceNo,shipmentInfoData?.carrierCode, shipmentInfoData?.SenderId, shipmentInfoData?.weightUnit, shipmentInfoData?.weight, shipmentInfoData?.dimensionUnit,shipmentInfoData?.lenght, shipmentInfoData?.width, shipmentInfoData?.height, shipmentInfoData?.currency, shipmentInfoData?.total, shipmentInfoData?.customerReference, shipmentInfoData?.shipDate, shipmentInfoData?.createdBy, shipmentInfoData?.clientCompanyId, shipmentInfoData?.consigneeId]);
//                     const ShipinsertedId = resultShipment.insertId;
//                     return { 
//                         message:"Shipment Create and Label Generete Succfully" , 
//                         data:{
//                             id:ShipinsertedId,
//                             trackingNo:shipmentInfoData?.trackingNo,
//                             invoiceNo:shipmentInfoData?.invoiceNo,
//                             carrierCode:shipmentInfoData?.carrierCode,
//                             SenderId:shipmentInfoData?.SenderId,
//                             weightUnit:shipmentInfoData?.weightUnit,
//                             weight:shipmentInfoData?.weight,
//                             dimensionUnit:shipmentInfoData?.dimensionUnit,
//                             lenght:shipmentInfoData?.lenght,
//                             width:shipmentInfoData?.width,
//                             height:shipmentInfoData?.height,
//                             currency:shipmentInfoData?.currency,
//                             total:shipmentInfoData?.total,
//                             customerReference:shipmentInfoData?.customerReference,
//                             shipDate:shipmentInfoData?.shipDate,
//                             createdBy:shipmentInfoData?.createdBy,
//                             clientCompanyId:shipmentInfoData?.clientCompanyId,
//                             consigneeId:shipmentInfoData?.consigneeId
//                         } 
//                     };
//                 }
//               }
              
//             }
//         }
//       }
//       return response?.data?.ShipmentResponse?.ShipmentResults;
//       // Respond with the UPS response
//       //return res.status(200).json(response.data);
//     } catch (error) {
//       console.error('Error generating shipment label:', error);
//       return res.status(500).json({ message: 'Error generating shipment label', error: error.message });
//     }
//   };

const GenMultiShipLabel = async (token,shipData,invoiceData) => {
  const shipmentData = shipData;
    try {
      const cityName = shipData?.ShipmentRequest?.Shipment?.ShipTo?.Address?.City;
      const CustomerContext = shipData?.ShipmentRequest?.Request?.TransactionReference?.CustomerContext;
      const query = new URLSearchParams({
        additionaladdressvalidation: cityName,
      }).toString();
      
      let header = {
        'Content-Type': 'application/json',
        transId: 'string',
        transactionSrc: 'testing',
        Authorization: `Bearer ${token}`,
      }

      const response = await axios.post(
        `${UPS_API_URL}/api/shipments/v2409/ship?${query}`,
        shipmentData
        ,
        {
          headers: header,
        }
      );
      let result = response?.data?.ShipmentResponse?.ShipmentResults;
      console.log("ShipmentIdentificationNumber:",result?.ShipmentIdentificationNumber)
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
        // console.log("consigneeInfo:",consigneeInfo)
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

        const sqlCong = `INSERT INTO consignee (clientCompanyId, name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const resultCons = await db(sqlCong, [consigneeInfo?.clientCompanyId,  consigneeInfo?.name, consigneeInfo?.companyName, consigneeInfo?.contactNo, consigneeInfo?.email, consigneeInfo?.countryCode, consigneeInfo?.stateCode,consigneeInfo?.postalCode, consigneeInfo?.city, consigneeInfo?.address]);
            consigneeId = resultCons.insertId;
        if(consigneeId !== "" || consigneeId !== null){
          const invoiceIdData = shipData?.ShipmentRequest?.Request?.TransactionReference?.CustomerContext
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
          
          
          const detailsContent = await invoiceInfoData.details.map(detail => {
            return `Description: ${detail.description}, HtsCode: ${detail.HtsCode}, Unit Price: ${detail.unitPrice}, Quantity: ${detail.Qty}, Total : ${detail.Qty*detail.unitPrice}`;
          }).join('\n'); // Join each detail with a newline

          const totalPrice = await invoiceInfoData.details?.reduce(
            (sum, item) => sum + (item.unitPrice * item.Qty || 0),
            0
          );

          // Convert the invoiceInfoData to text format
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
          // fs.writeFileSync(`${CustomerContext}.txt`, textContent);

          // const filePath = `${CustomerContext}.txt`;
          // const fileContent = fs.readFileSync(filePath);
          // const base64File = fileContent.toString('base64');

          const dirPath = path.join('/tmp', 'uploads');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          const filePath = path.join(dirPath, `${token}.txt`);

          // Write it to a text file
          fs.writeFileSync(filePath, textContent);

          // Read the file
          const fileContent = fs.readFileSync(filePath);
          const base64File = fileContent.toString('base64');

          //paperless documents start
          const paperless_res = await axios.post(
            `https://onlinetools.ups.com/api/paperlessdocuments/v1/upload`,
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
          console.log("paperless_res:",paperless_res);
            
            
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
            // console.log("invoiceId => ",invoiceId)
            if(invoiceId !== ''){
                const labelsdat = result?.PackageResults
                // console.log("labelsdat=>",labelsdat)
                const saveLabel = {
                    trackingId:result?.PackageResults[0].TrackingNumber,
                    graphicImage:result?.PackageResults[0].ShippingLabel?.GraphicImage,
                    createdBy:invoiceData?.createdBy
                }
               
              const sql = `
                    INSERT INTO labels (trackingId, graphicImage, invoiceId, createdBy) 
                    VALUES ${labelsdat?.map(() => '(?, ?, ?, ?)').join(', ')}`;
                    // Use your db function to execute the query
                let createdID = invoiceData?.createdBy
                const labelsDetail = labelsdat?.flatMap(d => [
                    d.TrackingNumber,
                    d.ShippingLabel?.GraphicImage,
                    invoiceId,
                    createdID,
                ]);
                // console.log("labelsDetail:=>",labelsDetail)
              const resultLabel = await db(sql, labelsDetail);
              if(resultLabel.insertId !==""){
                const sql = "UPDATE company SET labelCount = labelCount - 1 WHERE id = ? AND labelCount > 0";
                const resultUpdate = await db(sql, [invoiceData?.clientCompanyId]);
                if(resultUpdate !== ""){
                    let lenght = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
                        (sum, item) => sum + (Number(item.Dimensions?.Length) || 0),
                        0
                    )
                    let width = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
                        (sum, item) => sum + (Number(item.Dimensions?.Width) || 0),
                        0
                    )
                    let height = shipData?.ShipmentRequest?.Shipment?.Package?.reduce(
                        (sum, item) => sum + (Number(item.Dimensions?.Height) || 0),
                        0
                    )
           
                  const shipmentInfoData = {
                    trackingNo:result?.PackageResults[0].TrackingNumber,
                    invoiceNo:invoiceId,
                    carrierCode:'UPS',
                    SenderId:1,
                    weightUnit:result?.BillingWeight?.UnitOfMeasurement?.Code,
                    weight:result?.BillingWeight?.Weight,
                    height:height,
                    width:width,
                    lenght:lenght,
                    dimensionUnit:shipData?.ShipmentRequest?.Shipment?.Package[0]?.Dimensions?.UnitOfMeasurement?.Code,
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
                    const resultShipment = await db(sql, [shipmentInfoData?.trackingNo,shipmentInfoData?.invoiceNo,shipmentInfoData?.carrierCode, shipmentInfoData?.SenderId, shipmentInfoData?.weightUnit, shipmentInfoData?.weight, shipmentInfoData?.dimensionUnit,shipmentInfoData?.lenght, shipmentInfoData?.width, shipmentInfoData?.height, shipmentInfoData?.currency, shipmentInfoData?.total, shipmentInfoData?.customerReference, shipmentInfoData?.shipDate, shipmentInfoData?.createdBy, shipmentInfoData?.clientCompanyId, shipmentInfoData?.consigneeId]);
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
      //console.log("label response:", response?.status);
      return response?.data?.ShipmentResponse?.ShipmentResults;
      // Respond with the UPS response
      //return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error generating shipment label:', error);
      return res.status(500).json({ message: 'Error generating shipment label', error: error.message });
    }
  };

module.exports = { GenMultiShipLabel };