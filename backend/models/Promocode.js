import mongoose from 'mongoose';

const PromocodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a promo code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type (percentage or fixed)'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Please specify discount value'],
    },
    minOrderAmount: {
      type: Number,
      default: 0.00,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Promocode = mongoose.model('Promocode', PromocodeSchema);
export default Promocode;
