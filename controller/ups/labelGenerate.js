const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');
// Middleware to parse JSON bodies
app.use(express.json());
const UPS_API_URL = process.env.UPS_API_URL

// const generateShipmentLabel = async (req, res) => {
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

const generateShipmentLabel = async (token,shipmentData,cityName) => {
    try {
      // Check if the required properties are present in the request body
      //const {token} = req.body;
      //const token = process.env.UPSTOKEN
  
    //   if (!shipper || !shipTo || !shipFrom || !packageDetails) {
    //     return res.status(400).json({ message: 'Missing required fields in request body' });
    //   }
  
      // Example of API request (adjust based on your needs)

      const query = new URLSearchParams({
        additionaladdressvalidation: cityName,
      }).toString();
  
      const shipmentRequest = {
        ShipmentRequest: {
          Request: {
            SubVersion: "1801",
            RequestOption: "nonvalidate",
            TransactionReference: {
              CustomerContext: ""
            }
          },
          Shipment: {
            Description: "Ship WS test",
            Shipper: {
              Name: "Escm GmbH",
              AttentionName: "Shahzad Choudary",
              TaxIdentificationNumber: "DE331991534",
              Phone: {
                Number: "15202446893",
                Extension: "0049"
              },
              ShipperNumber: "A70C63",
              FaxNumber: "8002222222",
              Address: {
                AddressLine: ["Butzweilerhof Allee 3"],
                City: "Koln",
                StateProvinceCode: "NW",
                PostalCode: "50829",
                CountryCode: "DE"
              }
            },
            ShipTo: {
              Name: "Happy Dog Pet Supply",
              AttentionName: "1160b_74",
              Phone: {
                Number: "9225377171"
              },
              Address: {
                AddressLine: ["123 Main St"],
                City: "Timonium",
                StateProvinceCode: "MD",
                PostalCode: "21030",
                CountryCode: "US"
              },
              Residential: " "
            },
            ShipFrom: {
              Name: "Escm GmbH",
              AttentionName: "Shahzad Choudary",
              Phone: {
                Number: "015202446893"
              },
              FaxNumber: "",
              Address: {
                AddressLine: ["Butzweilerhof Allee 3"],
                City: "Koln",
                StateProvinceCode: "NW",
                PostalCode: "50829",
                CountryCode: "DE"
              }
            },
            PaymentInformation: {
              ShipmentCharge: {
                Type: "01",
                BillShipper: {
                  AccountNumber: "A70C63"
                }
              }
            },
            Service: {
              Code: "65",
              Description: "UPS Saver"
            },
            Package: {
              Description: "Test Package",
              Packaging: {
                Code: "02",
                Description: "Nails"
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: 'CM',
                  Description: 'Centimeters'
                },
                Length: '10',
                Width: '30',
                Height: '45'
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: "KGS",
                  Description: "Kilograms"
                },
                Weight: "5"
              }
            }
          },
          LabelSpecification: {
            LabelImageFormat: {
              Code: "GIF",
              Description: "GIF"
            },
            HTTPUserAgent: "Mozilla/4.5"
          }
        }
      };

     
      
      
      
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

      //console.log('label => ',response?.data?.ShipmentResponse?.ShipmentResults?.PackageResults)
      // console.log('GraphicImage => ',response?.data?.ShipmentResponse?.ShipmentResults?.PackageResults?.TrackingNumber)
      // const labelData = response?.ShipmentResponse?.LabelImage?.GraphicImage;
      // const labelFormat = response?.ShipmentResponse?.LabelImage?.LabelImageFormat?.Code || 'GIF';

      // if (!labelData) {
      //   throw new Error("No label data found in the response.");
      // }

      // // Decode the base64 data
      // const buffer = Buffer.from(labelData, 'base64');

      // // Define the file name
      // const fileName = `shipping_label.${labelFormat.toLowerCase()}`;

      // // Save the file
      // fs.writeFileSync(fileName, buffer);
      // console.log(`Shipping label saved as ${fileName}`);

      // console.log('response Information:',response);
      console.log("label response:", response);
      return response?.data?.ShipmentResponse?.ShipmentResults;
      // Respond with the UPS response
      //return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error generating shipment label:', error);
      return res.status(500).json({ message: 'Error generating shipment label', error: error.message });
    }
  };

module.exports = { generateShipmentLabel };