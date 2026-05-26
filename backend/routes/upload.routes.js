import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer)
    );

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploaded successfully',
      urls: imageUrls,
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ message: 'Failed to upload images to Cloudinary' });
  }
});

// Single image upload route (useful for avatar or simple product additions)
router.post('/single', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'keyshien_avatars');

    res.json({
      message: 'Image uploaded successfully',
      url: imageUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;
