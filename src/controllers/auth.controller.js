const User = require("../models/User");
const jwt = require("jsonwebtoken");
const blacklistedTokens = require('../utils/blacklist');

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const matched = await user.comparePassword(password);
    if (!matched) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function logout(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(400).json({ message: 'No token provided' });
      }

      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = authHeader.split(' ')[1];
      }
      blacklistedTokens.add(token);

      res.status(200).json({
        success: true,
        message:
          'Logged out successfully. Please remove the token from client.',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

module.exports = { register, login , logout};
