import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/nodemailer.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      isVerified: false, // Must verify email
    });

    if (user) {
      // Send verification email
      try {
        await sendVerificationEmail(user.email, user.name, verificationToken);
      } catch (err) {
        console.error('Error sending verification email:', err);
        // Do not fail register if mail fails, but note it
      }

      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.googleId && !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.googleId && !password) {
      return res.status(400).json({ message: 'This account is linked with Google Sign-In. Please log in with Google.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email address to log in.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! You can now log in.',
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Sign-In
// @route   POST /api/auth/google
// @access  Public
export const googleSignIn = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Google ID Token via Google API tokeninfo endpoint
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const payload = response.data;

    if (!payload.email) {
      return res.status(400).json({ message: 'Google authentication failed: Email not provided' });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but googleId is not linked, link it
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Auto-verify Google users
        if (!user.avatar || user.avatar.includes('default_avatar')) {
          user.avatar = avatar || user.avatar;
        }
        await user.save();
      }
    } else {
      // Create user
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true, // Google accounts are pre-verified
        avatar: avatar || 'https://res.cloudinary.com/dwquuisuj/image/upload/v1700000000/default_avatar.png',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google OAuth Error:', error.message);
    res.status(400).json({ message: 'Google Sign-In failed. Please try again.' });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    if (user.googleId) {
      return res.status(400).json({ message: 'This email is linked with Google Sign-In. Reset password via Google instead.' });
    }

    // Generate and hash password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      res.json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Error sending reset email. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
