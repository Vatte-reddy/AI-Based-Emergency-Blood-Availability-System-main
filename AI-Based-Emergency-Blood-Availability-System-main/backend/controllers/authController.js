const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }

    const token = generateToken(user);
    return res.status(200).json({ 
      message: "Registration successful.",
      token, 
      user 
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = generateToken(user);
    return res.status(200).json({ 
      message: "Login successful.",
      token, 
      user 
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required." });
    }

    if (otp.length < 4) {
      return res.status(400).json({ message: "OTP is invalid." });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "OTP verified successfully.",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed.", error: error.message });
  }
};
