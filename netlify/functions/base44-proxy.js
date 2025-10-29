// Netlify Function for Base44 API Proxy
// This function proxies requests to Base44 API to bypass CORS issues

const axios = require('axios');

exports.handler = async function(event, context) {
  const { httpMethod, path, body, headers } = event;
  
  // Extract the endpoint from the path (remove /api/base44/ prefix)
  const endpoint = path.replace(/^\/\.netlify\/functions\/base44-proxy\//, '');
  
  // Base44 configuration
  const BASE44_API_KEY = process.env.VITE_BASE44_API_KEY;
  const BASE44_APP_ID = process.env.VITE_BASE44_APP_ID;
  const BASE44_URL = `https://app.base44.com/api/apps/${BASE44_APP_ID}/${endpoint}`;
  
  if (!BASE44_API_KEY || !BASE44_APP_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Base44 configuration missing',
        message: 'VITE_BASE44_API_KEY and VITE_BASE44_APP_ID must be set'
      })
    };
  }

  try {
    const response = await axios({
      method: httpMethod,
      url: BASE44_URL,
      headers: {
        'api_key': BASE44_API_KEY,
        'Content-Type': 'application/json',
        ...headers
      },
      data: body ? JSON.parse(body) : undefined,
      validateStatus: status => true
    });

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Proxy failed to connect to Base44 API',
        details: error.message
      })
    };
  }
};