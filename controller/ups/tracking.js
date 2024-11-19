const axios = require('axios');

// exports.getTrackingDetails = async(req, res) => {
//     try {
//       const { inquiryNumber } = req.params;
//     //   1ZA70C630443518458
//     console.log('tracking:',inquiryNumber);
//     const tr = '1ZA70C630443518458';
//     const query = new URLSearchParams({
//         locale: 'en_US',
//         returnSignature: 'false',
//         returnMilestones: 'false',
//         returnPOD: 'false'
//       }).toString();
  
//       const url = `https://wwwcie.ups.com/api/track/v1/details/${inquiryNumber}?${query}`;
//       console.log(`Making request to: ${url}`); // Log the request URL
  
//       const response = await axios.get(url, {
//         headers: {
//           'transId': 'string',
//           'transactionSrc': 'testing',
//           'Authorization': `Bearer ${process.env.UPSTOKEN}`
//         }
//       });
  
//       res.status(200).json({
//         success: true,
//         data: response.data
//       });
//     } catch (error) {
//       console.error('Error fetching UPS tracking details:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to fetch UPS tracking details',
//         error: error.message
//       });
//     }
//   }
  
const trackPackage = async (inquiryNumber, token) => {
  try {
    const queryParams = new URLSearchParams({
      locale: 'en_US',
      returnSignature: 'false',
      returnMilestones: 'false',
      returnPOD: 'false'
    }).toString();
    
    const response = await axios.get(
      `https://onlinetools.ups.com/api/track/v1/details/${inquiryNumber}?${queryParams}`,
      {
        headers: {
          transId: 'string',
          transactionSrc: 'production',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error tracking package:', error.message);
    throw error;
  }
};

module.exports = { trackPackage };
