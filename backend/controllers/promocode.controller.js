import Promocode from '../models/Promocode.js';

// @desc    Get all promocodes (Admin)
// @route   GET /api/promocodes
// @access  Private/Admin
export const getPromocodes = async (req, res) => {
  try {
    const promocodes = await Promocode.find({}).sort({ createdAt: -1 });
    res.json(promocodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new promocode (Admin)
// @route   POST /api/promocodes
// @access  Private/Admin
export const createPromocode = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, expiryDate, isActive } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ message: 'Please provide promo code, type, and value' });
  }

  try {
    const exists = await Promocode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'A promo code with this name already exists' });
    }

    const promocode = new Promocode({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdPromo = await promocode.save();
    res.status(201).json(createdPromo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a promocode (Admin)
// @route   DELETE /api/promocodes/:id
// @access  Private/Admin
export const deletePromocode = async (req, res) => {
  try {
    const promocode = await Promocode.findById(req.params.id);

    if (promocode) {
      await promocode.deleteOne();
      res.json({ message: 'Promo code removed successfully' });
    } else {
      res.status(404).json({ message: 'Promo code not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a promo code (Public/Customer)
// @route   POST /api/promocodes/validate
// @access  Private
export const validatePromocode = async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Please provide a promo code' });
  }

  try {
    const promo = await Promocode.findOne({ code: code.toUpperCase() });

    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found or invalid' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ message: 'Promo code is inactive' });
    }

    // Check expiration date
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    // Check minimum order amount requirement
    const activeSubtotal = Number(subtotal) || 0;
    if (activeSubtotal < promo.minOrderAmount) {
      return res.status(400).json({
        message: `This promo code requires a minimum purchase amount of ₱${promo.minOrderAmount.toFixed(2)}`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = activeSubtotal * (promo.discountValue / 100);
    } else {
      discountAmount = promo.discountValue;
    }

    // Cap discount amount to the subtotal itself
    if (discountAmount > activeSubtotal) {
      discountAmount = activeSubtotal;
    }

    res.json({
      success: true,
      message: 'Promo code applied successfully!',
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active promocodes (Public/Customer)
// @route   GET /api/promocodes/active
// @access  Public
export const getActivePromocodes = async (req, res) => {
  try {
    const activePromos = await Promocode.find({
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(activePromos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
