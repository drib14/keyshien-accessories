import crypto from 'crypto';
import axios from 'axios';

const LALAMOVE_API_KEY = process.env.LALAMOVE_API_KEY;
const LALAMOVE_API_SECRET = process.env.LALAMOVE_API_SECRET;
const LALAMOVE_BASE_URL = 'https://rest.sandbox.lalamove.com'; // Lalamove Sandbox Endpoint

/**
 * Communicates with Lalamove Sandbox API by signing requests dynamically.
 * @param {string} method - HTTP method (GET, POST, DELETE etc.)
 * @param {string} path - Endpoint path (e.g. /v3/quotations)
 * @param {object} body - Optional payload object
 * @returns {object} - Lalamove API Response
 */
export const lalamoveRequest = async (method, path, body = null) => {
  const timestamp = Date.now().toString();
  const stringifiedBody = body ? JSON.stringify(body) : '';
  const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${stringifiedBody}`;

  const signature = crypto
    .createHmac('sha256', LALAMOVE_API_SECRET)
    .update(rawSignature)
    .digest('hex');

  const requestId = crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `hmackey ${LALAMOVE_API_KEY}:${signature}`,
    'Market': 'PH',
    'Request-ID': requestId,
    'Timestamp': timestamp,
  };

  try {
    const url = `${LALAMOVE_BASE_URL}${path}`;
    const response = await axios({
      method,
      url,
      headers,
      data: body || undefined,
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`Lalamove v3 API Error [${method} ${path}]:`, JSON.stringify(errorData));
    throw new Error(error.response?.data?.message || 'Lalamove Courier service is temporarily unavailable');
  }
};

/**
 * Books a Lalamove delivery automatically.
 * @param {object} order - Order document
 * @param {object} user - User document
 */
export const bookLalamoveDelivery = async (order, user) => {
  if (!order.lalamoveQuotationId) {
    console.error('Cannot book Lalamove: Missing lalamoveQuotationId');
    return null;
  }

  const payload = {
    data: {
      attributes: {
        quotationId: order.lalamoveQuotationId,
        sender: {
          name: 'Keyshien Handmade Boutique',
          phone: '+639171234567',
        },
        recipient: {
          name: user?.name || 'Keyshien Customer',
          phone: '+639178888888', // Standard PH sandbox test phone number
        },
      },
    },
  };

  try {
    const response = await lalamoveRequest('POST', '/v3/deliveries', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to book Lalamove delivery:', error.message);
    return null;
  }
};
