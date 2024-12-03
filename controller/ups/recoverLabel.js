const axios = require('axios');
const fs = require('fs');
const path = require('path');
const UPS_API_URL = process.env.UPS_API_URL

const recoverLabel = async (token, trackingNumber) => {
  try {
    const url = `${UPS_API_URL}/api/labels/v1/recovery`;

    const headers = {
      'Content-Type': 'application/json',
      transId: 'string',
      transactionSrc: 'production',
      Authorization: `Bearer ${token}`,
    }
    console.log("headers:",headers,'trackingNumber',trackingNumber)
    const body = {
      LabelRecoveryRequest: {
        LabelDelivery: {
          LabelLinkIndicator: '',
          ResendEmailIndicator: ''
        },
        LabelSpecification: {
          HTTPUserAgent: 'Mozilla/4.5',
          LabelImageFormat: {Code: 'GIF'}
        },
        Request: {
          RequestOption: 'Non_Validate',
          SubVersion: '1903',
          TransactionReference: {CustomerContext: ''}
        },
        TrackingNumber: trackingNumber,
        Translate: {
          Code: '01',
          DialectCode: 'US',
          LanguageCode: 'eng'
        }
      }
    };

    const response = await axios.post(url, body, { headers });

    console.log("reponse:",response?.data?.LabelRecoveryResponse?.LabelResults)
    return response?.data?.LabelRecoveryResponse?.LabelResults
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