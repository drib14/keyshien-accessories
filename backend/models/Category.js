import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide category cover image'],
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', CategorySchema);
export default Category;
