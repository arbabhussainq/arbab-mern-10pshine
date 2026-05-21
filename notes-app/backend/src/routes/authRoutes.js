const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateInfo,
  updatePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile/info", protect, updateInfo);
router.put("/profile/password", protect, updatePassword);

module.exports = router;
