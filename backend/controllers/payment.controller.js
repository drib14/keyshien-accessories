import axios from 'axios';
import Order from '../models/Order.js';

// Base64 encode the Paymongo Secret Key (which was supplied under PAYMONGO_PUBLIC_KEY as it starts with sk_)
const getPaymongoAuthHeader = () => {
  const secretKey = process.env.PAYMONGO_PUBLIC_KEY;
  return 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
};

// @desc    Create Paymongo checkout session
// @route   POST /api/payments/create-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Convert items into Paymongo line items format
    // Amount must be in cents (PHP * 100)
    const lineItems = order.orderItems.map((item) => ({
      amount: Math.round(item.price * 100),
      currency: 'PHP',
      name: item.name,
      quantity: item.qty,
      images: [item.image],
    }));

    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            billing: {
              name: order.user.name,
              email: order.user.email,
            },
            line_items: lineItems,
            payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            success_url: `${process.env.FRONTEND_URL}/checkout-success?order_id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/orders/${order._id}?payment_cancelled=true`,
            description: `Payment for Order #${order._id}`,
          },
        },
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: getPaymongoAuthHeader(),
        },
      }
    );

    const session = response.data.data;
    const checkoutUrl = session.attributes.checkout_url;

    // Save checkout session details on order
    order.paymentResult = {
      paymongoCheckoutId: session.id,
      status: 'pending',
    };
    await order.save();

    res.json({ checkoutUrl });
  } catch (error) {
    console.error('Paymongo Session Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to create payment checkout session with Paymongo',
      error: error.response?.data?.errors || error.message,
    });
  }
};

// @desc    Verify Paymongo checkout session status
// @route   GET /api/payments/verify/:sessionId/:orderId
// @access  Private
export const verifyCheckoutSession = async (req, res) => {
  const { sessionId, orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
      {
        headers: {
          accept: 'application/json',
          authorization: getPaymongoAuthHeader(),
        },
      }
    );

    const session = response.data.data;
    const paymentStatus = session.attributes.payment_intent?.attributes?.status;

    if (paymentStatus === 'succeeded') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.fulfillmentStatus = 'Processing'; // Update status to Processing since paid
      order.paymentResult = {
        id: session.attributes.payment_intent.id,
        status: 'paid',
        paymongoCheckoutId: sessionId,
      };
      await order.save();

      res.json({ message: 'Payment verified and verified successfully', success: true, order });
    } else {
      res.json({ message: `Payment not completed. Status: ${paymentStatus || 'unknown'}`, success: false });
    }
  } catch (error) {
    console.error('Paymongo Verification Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to verify payment with Paymongo',
      error: error.response?.data?.errors || error.message,
    });
  }
};
