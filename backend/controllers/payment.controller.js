import axios from 'axios';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Base64 encode the Paymongo Secret Key (robustly detecting the key starting with sk_ in case they are swapped in .env)
const getPaymongoAuthHeader = () => {
  let secretKey = process.env.PAYMONGO_SECRET_KEY || '';
  
  if (process.env.PAYMONGO_SECRET_KEY && process.env.PAYMONGO_SECRET_KEY.startsWith('sk_')) {
    secretKey = process.env.PAYMONGO_SECRET_KEY;
  } else if (process.env.PAYMONGO_PUBLIC_KEY && process.env.PAYMONGO_PUBLIC_KEY.startsWith('sk_')) {
    secretKey = process.env.PAYMONGO_PUBLIC_KEY;
  }
  
  return 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
};

// @desc    Create Paymongo checkout session
// @route   POST /api/payments/create-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

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
            payment_method_types: paymentMethod ? [paymentMethod] : ['card', 'gcash', 'paymaya', 'grab_pay'],
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

    // Fallback if sessionId is Stripe-like placeholder or empty
    const activeSessionId = (sessionId && sessionId !== '{CHECKOUT_SESSION_ID}')
      ? sessionId
      : order.paymentResult?.paymongoCheckoutId;

    if (!activeSessionId) {
      return res.status(400).json({ message: 'Checkout session ID not found for this order' });
    }

    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${activeSessionId}`,
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
      const wasPaid = order.isPaid;
      order.isPaid = true;
      order.paidAt = Date.now();
      order.fulfillmentStatus = 'Processing'; // Update status to Processing since paid
      order.paymentResult = {
        id: session.attributes.payment_intent.id,
        status: 'paid',
        paymongoCheckoutId: activeSessionId,
      };
      await order.save();

      // Award points if not already paid
      if (!wasPaid) {
        const pointsEarned = Math.floor(order.totalPrice / 100);
        if (pointsEarned > 0) {
          const user = await User.findById(order.user);
          if (user) {
            user.rewardPoints += pointsEarned;
            await user.save();
          }
        }
      }

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

// @desc    Create Paymongo checkout session for Wallet Top-up
// @route   POST /api/payments/topup
// @access  Private
export const createWalletTopupSession = async (req, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Please specify a valid top-up amount' });
  }

  try {
    const user = await User.findById(req.user._id);

    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            billing: {
              name: user.name,
              email: user.email,
            },
            line_items: [
              {
                amount: Math.round(Number(amount) * 100), // In cents
                currency: 'PHP',
                name: 'Keyshien Wallet Balance Top-up',
                quantity: 1,
              },
            ],
            payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            success_url: `${process.env.FRONTEND_URL}/wallet?topup_success=true&session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
            cancel_url: `${process.env.FRONTEND_URL}/wallet?topup_cancelled=true`,
            description: `Wallet Top-up for Customer ${user.name}`,
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
    
    // Save pending top-up session details on user for verification fallback
    user.pendingTopupSessionId = session.id;
    user.pendingTopupAmount = Number(amount);
    await user.save();

    res.json({ checkoutUrl: session.attributes.checkout_url });
  } catch (error) {
    console.error('Paymongo Top-up Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to create top-up checkout session with Paymongo',
      error: error.response?.data?.errors || error.message,
    });
  }
};

// @desc    Verify Paymongo checkout session status & Credit Wallet Balance
// @route   GET /api/payments/verify-topup/:sessionId/:amount
// @access  Private
export const verifyWalletTopupSession = async (req, res) => {
  const { sessionId, amount } = req.params;

  try {
    const user = await User.findById(req.user._id);

    // Fallback if sessionId is Stripe-like placeholder or empty
    const activeSessionId = (sessionId && sessionId !== '{CHECKOUT_SESSION_ID}')
      ? sessionId
      : user.pendingTopupSessionId;

    const activeAmount = (amount && Number(amount) > 0)
      ? Number(amount)
      : user.pendingTopupAmount;

    if (!activeSessionId) {
      return res.status(400).json({ message: 'No pending top-up session found to verify' });
    }

    const response = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${activeSessionId}`,
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
      const topupAmount = Number(activeAmount);
      
      // Prevent double crediting using pendingTopupSessionId checks
      if (user.pendingTopupSessionId === activeSessionId) {
        user.walletBalance += topupAmount;
        // Clear pending top-up session details upon successful crediting
        user.pendingTopupSessionId = '';
        user.pendingTopupAmount = 0;
        await user.save();
      }

      res.json({
        message: 'Top-up successful! Your wallet balance has been credited.',
        success: true,
        walletBalance: user.walletBalance,
      });
    } else {
      res.json({ message: `Top-up payment not completed. Status: ${paymentStatus || 'unknown'}`, success: false });
    }
  } catch (error) {
    console.error('Paymongo Top-up Verification Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to verify top-up payment with Paymongo',
      error: error.response?.data?.errors || error.message,
    });
  }
};
