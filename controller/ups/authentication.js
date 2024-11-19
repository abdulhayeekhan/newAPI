const axios = require('axios');
const UPS_API_URL = process.env.UPS_API_URL
exports.getOAuthToken = async (req, res) => {
    const formData = new URLSearchParams({
        grant_type: 'client_credentials',
      });
    
      const clientId = 'R31uXyGS62uZnJK8iZfyPz7RfnpivFKdxksc6URYTeFWuLTw';  // Replace with your Client ID
      const clientSecret = 'vHj6oAefJiojt1OFOR8dKUnd91deptGP0dGHGgMJEXmLkugiWfOt7V7Jmel2yG7G';
    try {
    const response = await axios.post(`${UPS_API_URL}/security/v1/oauth/token`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
    });
    const accessToken = response.data.access_token;
    console.log('Access Token:', response);
    //return accessToken;
    // Send the response data back to the client
    return accessToken;
    // res.status(200).json({
    //   token: accessToken,
    // });
  } catch (error) {
    console.error('Error fetching OAuth token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve OAuth token',
      error: error.message,
    });
  }
};
