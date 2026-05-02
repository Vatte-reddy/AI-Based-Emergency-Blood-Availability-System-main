const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyOtp,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verifyOtp);
router.post("/google-login", googleLogin);

module.exports = router;
