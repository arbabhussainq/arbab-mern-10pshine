const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateInfo,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile/info", protect, updateInfo);
router.put("/profile/password", protect, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
