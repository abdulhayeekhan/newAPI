const axios = require('axios');
const fs = require('fs');
const path = require('path');
const UPS_API_URL = process.env.UPS_API_URL

const recoverLabel = async (token, trackingNumber) => {
  try {
    // const url = ` https://onlinetools.ups.com/ship/v1/shipments/labels`;

    // const headers = {
    //   'Content-Type': 'application/json',
    //   transId: 'string',
    //   transactionSrc: 'production',
    //   Authorization: `Bearer ${token}`,
    // }
    // console.log("headers:",headers,'trackingNumber',trackingNumber)
    // const body = {
    //   LabelRecoveryRequest: {
    //     LabelDelivery: {
    //       LabelLinkIndicator: '',
    //       ResendEmailIndicator: ''
    //     },
    //     LabelSpecification: {
    //       HTTPUserAgent: 'Mozilla/4.5',
    //       LabelImageFormat: { Code: 'ZPL' },
    //       LabelStockSize: { Height: '6', Width: '4' }
    //     },
    //     Request: {
    //       RequestOption: 'Non_Validate',
    //       SubVersion: '1903',
    //       TransactionReference: { CustomerContext: '' }
    //     },
    //     TrackingNumber: trackingNumber,
    //     Translate: {
    //       Code: '01',
    //       DialectCode: 'US',
    //       LanguageCode: 'eng'
    //     }
    //   }
    // };

    // const response = await axios.post(url, body, { headers });

    // return response


    const response = await axios.post(
            `https://onlinetools.ups.com/ship/v1/shipments/labels`,
            {
              LabelRecoveryRequest: {
                LabelDelivery: {
                  LabelLinkIndicator: '',
                  ResendEmailIndicator: ''
                },
                LabelSpecification: {
                  HTTPUserAgent: 'Mozilla/4.5',
                  LabelImageFormat: { Code: 'ZPL' },
                  LabelStockSize: { Height: '6', Width: '4' }
                },
                Request: {
                  RequestOption: 'Non_Validate',
                  SubVersion: '1903',
                  TransactionReference: { CustomerContext: "" }
                },
                TrackingNumber: trackingNumber, // Use trackingNumber passed in the request body
                Translate: {
                  Code: '01',
                  DialectCode: 'US',
                  LanguageCode: 'eng'
                }
              }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                transId: 'string',
                transactionSrc: 'testing',
                Authorization: `Bearer ${token}` // Replace with your actual Bearer token
              }
            }
          );
    // const labelImageBase64 = response.LabelRecoveryResponse?.LabelResults?.[0]?.LabelImage?.GraphicImage;

    // if (!labelImageBase64) {
    //   return res.status(400).json({ message: 'Label image data not found in the response.' });
    // }

    // Decode the base64 image
    // const labelBuffer = Buffer.from(labelImageBase64, 'base64');

    // // Define the file path to save the image
    // const filePath = path.join(__dirname, 'shipping_label.png');

    // // Write the decoded image to a file
    // fs.writeFileSync(filePath, labelBuffer);

    // // Respond with success and the path to the saved label
    // res.status(200).json({
    //   message: 'Label generated successfully.',
    //   labelPath: filePath,
    // });
    //console.log('Label recovery successful:', response.data);
    const data = response?.data?.LabelRecoveryResponse?.LabelResults
    return data;
  } catch (error) {
    // console.error('Error during label recovery:', error.response?.data || error.message);
    // throw error;
    if (error.response) {
        console.error('Error during label recovery:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`UPS API Error: ${error.response.data.errors[0].message || 'Unknown error'}`);
      } else {
        console.error('Error during label recovery:', error.message);
        throw error;
    }
  }
};

module.exports = { recoverLabel };