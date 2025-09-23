const sgMail = require('@sendgrid/mail');

// Set CORS headers for preflight and actual requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event, context) => {
  console.log('=== EMAIL FUNCTION STARTED ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.error('Invalid HTTP method:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('Parsing request body...');
    console.log('Raw body:', event.body);
    
    const { customerName, customerEmail, customerWhatsapp, cartItems, totalPrice, orderId } = JSON.parse(event.body);
    
    console.log('=== PARSED REQUEST DATA ===');
    console.log('Customer Name:', customerName);
    console.log('Customer Email:', customerEmail);
    console.log('Customer WhatsApp:', customerWhatsapp);
    console.log('Order ID:', orderId);
    console.log('Total Price:', totalPrice);
    console.log('Cart Items Count:', cartItems ? cartItems.length : 0);
    console.log('Cart Items:', JSON.stringify(cartItems, null, 2));

    // Validate required fields
    if (!customerName || !customerEmail || !totalPrice || !orderId) {
      console.error('=== VALIDATION FAILED ===');
      console.error('Missing fields:', {
        customerName: !!customerName,
        customerEmail: !!customerEmail,
        totalPrice: !!totalPrice,
        orderId: !!orderId
      });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Ensure cartItems is always an array
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    console.log('Safe Cart Items Count:', safeCartItems.length);
    // Set SendGrid API Key from environment variables
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.error('=== SENDGRID CONFIGURATION ERROR ===');
      console.error('SENDGRID_API_KEY environment variable is not set');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Email service configuration error' }),
      };
    }
    
    console.log('=== SENDGRID SETUP ===');
    console.log('SendGrid API Key found:', sendGridApiKey ? 'YES' : 'NO');
    console.log('API Key length:', sendGridApiKey ? sendGridApiKey.length : 0);
    console.log('API Key starts with SG.:', sendGridApiKey ? sendGridApiKey.startsWith('SG.') : false);

    sgMail.setApiKey(sendGridApiKey);
    console.log('SendGrid API key set successfully');

    // --- Email to Merchant ---
    console.log('=== PREPARING MERCHANT EMAIL ===');
    
    // Generate order items HTML
    const orderItemsHtml = safeCartItems.length > 0 
      ? safeCartItems.map(item => `<li>${item.name} (Qty: ${item.quantity}, Price: ₱${item.price.toLocaleString()})</li>`).join('')
      : '<li>Direct payment (no cart items)</li>';
    
    const merchantMsg = {
      to: 'ilawilawvilla@gmail.com', // Your actual merchant email
      from: 'ilawilawvilla@gmail.com', // Your verified SendGrid sender email
      subject: `New Order Received: #${orderId}`,
      html: `
        <h1>New Order Received!</h1>
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>Total Amount: <strong>₱${totalPrice.toLocaleString()}</strong></p>
        <h2>Customer Details:</h2>
        <ul>
          <li>Name: ${customerName}</li>
          <li>Email: ${customerEmail}</li>
          <li>WhatsApp: ${customerWhatsapp}</li>
        </ul>
        <h2>Order Items:</h2>
        <ul>
          ${orderItemsHtml}
        </ul>
        <p>View order in admin: <a href="https://boracay.house/admin/orders">Admin Dashboard</a></p>
      `,
    };
    console.log('Merchant email prepared:', {
      to: merchantMsg.to,
      from: merchantMsg.from,
      subject: merchantMsg.subject
    });

    // --- Email to Client ---
    console.log('=== PREPARING CLIENT EMAIL ===');
    
    // Generate client order items HTML
    const clientOrderItemsHtml = safeCartItems.length > 0 
      ? safeCartItems.map(item => `<li>${item.name} (Qty: ${item.quantity}, Price: ₱${item.price.toLocaleString()})</li>`).join('')
      : '<li>Payment processed successfully</li>';
    
    const clientMsg = {
      to: customerEmail,
      from: 'ilawilawvilla@gmail.com', // Your verified SendGrid sender email
      subject: `Your Boracay.House Order Confirmation: #${orderId}`,
      html: `
        <h1>Thank You for Your Order, ${customerName}!</h1>
        <p>Your order (ID: <strong>${orderId}</strong>) has been received and is being processed.</p>
        <p>Total Amount: <strong>₱${totalPrice.toLocaleString()}</strong></p>
        <h2>Order Summary:</h2>
        <ul>
          ${clientOrderItemsHtml}
        </ul>
        <p>We will contact you shortly with further details.</p>
        <p>If you have any questions, please reply to this email or contact us on WhatsApp at +63 961 792 8834.</p>
        <br>
        <p>Best regards,<br>The Boracay.House Team</p>
      `,
    };
    console.log('Client email prepared:', {
      to: clientMsg.to,
      from: clientMsg.from,
      subject: clientMsg.subject
    });

    // Send both emails
    console.log('=== SENDING EMAILS ===');
    console.log('Attempting to send merchant email...');
    
    await Promise.all([
      sgMail.send(merchantMsg)
        .then(() => {
          console.log('✅ Merchant email sent successfully to:', merchantMsg.to);
        })
        .catch(err => {
          console.error('❌ Error sending merchant email:', err.response ? err.response.body : err.message);
          console.error('Full merchant email error:', JSON.stringify(err, null, 2));
        }),
      sgMail.send(clientMsg)
        .then(() => {
          console.log('✅ Client email sent successfully to:', clientMsg.to);
        })
        .catch(err => {
          console.error('❌ Error sending client email:', err.response ? err.response.body : err.message);
          console.error('Full client email error:', JSON.stringify(err, null, 2));
        })
    ]);

    console.log('=== EMAIL FUNCTION COMPLETED SUCCESSFULLY ===');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Emails sent successfully!' }),
    };
  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error sending email:', error.response ? error.response.body : error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: 'Failed to send emails', 
        error: error.message,
        details: error.response ? error.response.body : 'Unknown error'
      }),
    };
  }
};