const axios = require('axios');
const fs = require('fs');
const path = require('path');

const recoverLabel = async (token, trackingNumber) => {
  try {
    const url = `https://onlinetools.ups.com/ship/v1/shipments/labels`;

    const headers = {
      'Content-Type': 'application/json',
      transId: 'string',
      transactionSrc: 'production',
      Authorization: `Bearer eyJraWQiOiI2NGM0YjYyMC0yZmFhLTQzNTYtYjA0MS1mM2EwZjM2Y2MxZmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzM4NCJ9.eyJzdWIiOiJlc2NtNjZAZ21haWwuY29tIiwiY2xpZW50aWQiOiJSMzF1WHlHUzYydVpuSks4aVpmeVB6N1JmbnBpdkZLZHhrc2M2VVJZVGVGV3VMVHciLCJpc3MiOiJodHRwczovL2FwaXMudXBzLmNvbSIsInV1aWQiOiI2ODNDRTAwMi0wRkE0LTFERTYtQTNERC01MUJFRkYxNkEzN0QiLCJzaWQiOiI2NGM0YjYyMC0yZmFhLTQzNTYtYjA0MS1mM2EwZjM2Y2MxZmEiLCJhdWQiOiJUSEMiLCJhdCI6InBlSWE2cnM1VFhJNE9sUkhJQ2l3Y0J2anVreTgiLCJuYmYiOjE3MzE3NDM4MDAsInNjb3BlIjoiTG9jYXRvcldpZGdldCIsIkRpc3BsYXlOYW1lIjoiVEhDIiwiZXhwIjoxNzMxNzU4MjAwLCJpYXQiOjE3MzE3NDM4MDAsImp0aSI6IjI1ZDVlOTIyLTY2NjktNDA2Ni05NTc0LWViOTMxNTFkYTAwMSJ9.heB3Wgow43UPSjy8_NMWS4bisvjYbB2QfgqVAyc_iO3GoT5LSrUsgpOUhzgzhIt__ctVunQzHuQQhgPLCa07j5amT0x0Ku__CRHoWbcDqZQOaRDK3JqysQehnNxa6RgkhHwcJ0WTpujOmLA-nyrI68mbpqPwsepU8n8ZvVqgdrDS3_sIJwEgFWfufIfdFIfTvCaAy--tTPnvn_8VqKL9-LA7aFYZ8Td_HLFeL5KJQMacxKIOb0PZ0aaYqG9uIjNNdnFDhBfPcjjRLeF5pj96KgGry-ct_QEtnTAb1YxTQ6iz7flsswED1fA_hW-LA523siRn9Tg1rJSBn4IS-MAaC-C6UyZ8kmnY3E9aqeJrfoy6P1uVAEYc5xCkrhLyyom2dvOXWX1HSjugRcWS-70IlmrL4GzNjJKrAutHe2bT72O-cR7TvBvYstbcycImwurm5gp2QQlykM5VRibWfFHYiBLMDoXIIXdTq6AVLYydJatfhb7dn3NI02xJzogzA1WslvtuHBLA38SRr6GmWveTuzb2cTf3M87RTiiYCv64739e0HVfAZUTZeDQOy2hrI3aKTh4DogOtNfrn0-hgkKnmwgN9X-ZGmIKfSE5wDQ2m5hrgXhGdA3_th3nL1eSAYe8PvcQs3dXpJv800_0oheZfyMqx2X_ygQuHiShPZ5Z5cQ`,
      Username: 'escm66',
      Password: '$Punjab_50829'
    };

    const body = {
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
          TransactionReference: { CustomerContext: '' }
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

    const labelImageBase64 = response.LabelRecoveryResponse?.LabelResults?.[0]?.LabelImage?.GraphicImage;

    if (!labelImageBase64) {
      return res.status(400).json({ message: 'Label image data not found in the response.' });
    }

    // Decode the base64 image
    const labelBuffer = Buffer.from(labelImageBase64, 'base64');

    // Define the file path to save the image
    const filePath = path.join(__dirname, 'shipping_label.png');

    // Write the decoded image to a file
    fs.writeFileSync(filePath, labelBuffer);

    // Respond with success and the path to the saved label
    res.status(200).json({
      message: 'Label generated successfully.',
      labelPath: filePath,
    });
    //console.log('Label recovery successful:', response.data);
    //return response.data;
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