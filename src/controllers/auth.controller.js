const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const blacklistedTokens = require("../utils/blacklist");

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ message: "Email already in use" });

      const userCount = await User.countDocuments();
      const finalRoleName = userCount === 0 ? "admin" : role || "connected";
      const roleDoc = await Role.findOne({ name: finalRoleName });

      const user = await User.create({
        name,
        email,
        password,
        role: roleDoc._id,
      });

      const payload = { id: user._id, role: roleDoc.name };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: roleDoc.name,
          },
          token,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const matched = await user.comparePassword(password);
      if (!matched)
        return res.status(400).json({ message: "Invalid credentials" });

      const roleDoc = await Role.findById(user.role);

      const payload = { id: user._id, role: roleDoc.name };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: roleDoc.name,
          },
          token,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({ message: "No token provided" });
      }
      let token;
      if (authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
      }
      blacklistedTokens.add(token);

      res.status(200).json({
        success: true,
        message:
          "Logged out successfully. Please remove the token from client.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // --------------------- Google OAuth Callback ---------------------
  async googleCallback(req, res) {
    try {
      const user = req.user;
      const roleDoc = await Role.findById(user.role);

      const payload = { id: user._id, role: roleDoc.name };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.json({
        message: "Login with Google success",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: roleDoc.name,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Google login failed" });
    }
  }

  // --------------------- GitHub OAuth Callback ---------------------
  async githubCallback(req, res) {
    try {
      const user = req.user;
      const roleDoc = await Role.findById(user.role);
      const payload = { id: user._id, role: roleDoc.name };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.json({
        message: "Login with GitHub success",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: roleDoc.name,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "GitHub login failed" });
    }
  }
}

module.exports = new AuthController();
