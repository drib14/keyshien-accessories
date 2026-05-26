import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Promocode from '../models/Promocode.js';

// @desc    Create new order & decrement stock
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    coordinates,
    paymentMethod,
    totalPrice,
    promocode,
    discountAmount,
  } = req.body;

  try {
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Double check inventory and decrement stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        });
      }
    }

    // Handle Wallet payment verification
    let isPaid = false;
    let paidAt = null;
    let fulfillmentStatus = 'Pending';
    let paymentResult = {};

    if (paymentMethod === 'Wallet') {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.walletBalance < totalPrice) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct balance and award reward points (1 point per 100 spent)
      user.walletBalance -= totalPrice;
      const pointsEarned = Math.floor(totalPrice / 100);
      user.rewardPoints += pointsEarned;
      await user.save();

      isPaid = true;
      paidAt = Date.now();
      fulfillmentStatus = 'Processing'; // Start as processing since paid
      paymentResult = {
        id: 'wallet_debit_' + Date.now(),
        status: 'paid',
      };
    }

    // Decrement stocks
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      coordinates,
      paymentMethod,
      totalPrice,
      promocode,
      discountAmount: discountAmount || 0,
      isPaid,
      paidAt,
      fulfillmentStatus,
      paymentResult,
    });

    const createdOrder = await order.save();

    // Increment promocode usage count if a promo code was applied
    if (promocode) {
      try {
        await Promocode.findOneAndUpdate(
          { code: promocode.toUpperCase() },
          { $inc: { usageCount: 1 } }
        );
      } catch (err) {
        console.error('Failed to increment promocode usage count:', err);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'images name price');

    if (order) {
      // Allow only the order owner or an admin to access
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const wasPaid = order.isPaid;
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        paymongoCheckoutId: req.body.paymongoCheckoutId,
      };

      const updatedOrder = await order.save();

      // Award points if transitioning to paid
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

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order fulfillment status (Admin)
// @route   PUT /api/orders/:id/fulfill
// @access  Private/Admin
export const updateOrderFulfillment = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const wasPaid = order.isPaid;
      order.fulfillmentStatus = status;
      if (status === 'Delivered') {
        order.isPaid = true; // Auto paid if COD and delivered, or just mark delivered
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

      if (status === 'Delivered' && !wasPaid) {
        const pointsEarned = Math.floor(order.totalPrice / 100);
        if (pointsEarned > 0) {
          const user = await User.findById(order.user);
          if (user) {
            user.rewardPoints += pointsEarned;
            await user.save();
          }
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
