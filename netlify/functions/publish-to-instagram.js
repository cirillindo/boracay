const axios = require('axios');
const { URL } = require('url');

// Enhanced configuration
const API_VERSION = 'v20.0';
const INSTAGRAM_BUSINESS_ACCOUNT_ID = '1115655617225714'; // Your specific account ID
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Only POST requests are accepted' })
    };
  }

  try {
    // Validate and parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (e) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }

    const { imageUrl, caption, title } = requestBody;

    // Validate required fields
    if (!imageUrl) throw new Error('imageUrl is required');
    try {
      new URL(imageUrl); // Validate URL format
    } catch (e) {
      throw new Error(`Invalid imageUrl: ${e.message}`);
    }

    // Get and validate access token
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) throw new Error('Missing Facebook access token');

    // Format caption
    const formattedCaption = caption || 
      (title ? `New post: ${title}` : 'Check out our latest post') + 
      '\n\n#Boracay';

    // Step 1: Create Media Container
    let creationId;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const createResponse = await axios.post(
          `https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
          null, // Important: null body for params to work correctly
          {
            params: {
              image_url: imageUrl,
              caption: formattedCaption,
              access_token: accessToken
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (!createResponse.data.id) {
          throw new Error('No creation ID returned from Facebook');
        }

        creationId = createResponse.data.id;
        break; // Success, exit retry loop
      } catch (error) {
        if (attempt === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    // Step 2: Publish the Media
    let postId;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const publishResponse = await axios.post(
          `https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
          null,
          {
            params: {
              creation_id: creationId,
              access_token: accessToken
            }
          }
        );

        if (!publishResponse.data.id) {
          throw new Error('No post ID returned from Facebook');
        }

        postId = publishResponse.data.id;
        break; // Success, exit retry loop
      } catch (error) {
        if (attempt === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        postId,
        creationId,
        permalink: `https://www.instagram.com/p/${postId}/`,
        message: 'Successfully published to Instagram'
      })
    };

  } catch (error) {
    console.error('Instagram publish error:', {
      message: error.message,
      stack: error.stack,
      responseData: error.response?.data,
      statusCode: error.response?.status
    });

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to publish to Instagram',
        details: {
          message: error.message,
          facebookError: error.response?.data?.error || null,
          suggestion: error.response?.status === 400 
            ? 'Check your access token and permissions' 
            : 'Try again later'
        }
      })
    };
  }
};