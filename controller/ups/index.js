const axios = require('axios');

exports.GenShipLabelWithUPSAPI = async (req, res) => {
  try {
    // Define the headers required for the third-party API
    const headers = {
      AccessLicenseNumber: process.env.UPD_AccessLicenseNumber,
      Password: process.env.UPS_Password,
      'Content-Type': 'application/json',
      transId: process.env.UPSTransId,
      transactionSrc: process.env.UPS_TransactionSrc,
      Username: process.env.UPS_Username,
      Accept: 'application/json',
    };

    // Define any data you want to send in the request body
    const body = req.body;

    // Make the POST request to the third-party API
    const response = await axios.post(`${process.env.UPS_API_URL}/${process.env.UPS_Version}/your-endpoint`, body, { headers });
    // Return the response from the third-party API to the client
    res.status(200).json({
      success: true,
      data: response.ShipmentResponse,
    });
  } catch (error) {
    // Handle any errors that occur during the API call
    console.error('API call error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to call third-party API',
      error: error.message,
    });
  }
};
