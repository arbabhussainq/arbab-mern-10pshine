const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed - email already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed - wrong password for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error(`getProfile error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const updateInfo = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true },
    );

    logger.info(`Name updated for user: ${user.email}`);
    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    logger.error(`updateInfo error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      logger.warn(`Password update failed - wrong current password for: ${user.email}`);
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error(`updatePassword error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateInfo, updatePassword };
