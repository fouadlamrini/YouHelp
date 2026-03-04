const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const blacklistedTokens = require("../utils/blacklist");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

class AuthController {

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const userCount = await User.countDocuments();

      let role = null;
      let roleName = "etudiant";
      let status = undefined;

      if (userCount === 0) {
        const superAdminRole = await Role.findOne({ name: "super_admin" });
        if (!superAdminRole) {
          return res.status(500).json({ message: "super_admin role not found" });
        }
        role = superAdminRole._id;
        roleName = superAdminRole.name;
        status = "active";
      } else {
        const etudiantRole = await Role.findOne({ name: "etudiant" });
        if (etudiantRole) role = etudiantRole._id;
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        status
      });

      const payload = { id: user._id, role: roleName };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            status: user.status,
            role: roleName,
            profilePicture: user.profilePicture
          },
          token
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
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

      let roleName = "etudiant";
      if (user.role) {
        const roleDocument = await Role.findById(user.role);
        if (roleDocument) roleName = roleDocument.name;
      }

      const payload = { id: user._id, role: roleName };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            status: user.status,
            role: roleName,
            profilePicture: user.profilePicture
          },
          token
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password required" });
      }
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.password) {
        return res.status(400).json({ message: "Cannot change password for OAuth accounts" });
      }
      const matched = await user.comparePassword(currentPassword);
      if (!matched) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
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
        message: "Logged out successfully. Please remove the token from client."
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ================= GOOGLE CALLBACK =================
  async googleCallback(req, res) {
    try {
      console.log('Google OAuth Callback - User:', req.user);
      const user = req.user;
      let roleName = "etudiant";

      if (user.role) {
        const roleDocument = await Role.findById(user.role);
        if (roleDocument) roleName = roleDocument.name;
      }

      const payload = { id: user._id, role: roleName };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleName,
        profilePicture: user.profilePicture
      };

      // Redirect to frontend with token and user data
      const redirectUrl = `http://localhost:5173/oauth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      console.log('Google OAuth - Redirect URL:', redirectUrl);
      res.redirect(redirectUrl);

    } catch (err) {
      console.error('Google OAuth error:', err);
      res.status(500).json({ message: "Google login failed" });
    }
  }

  // ================= GITHUB CALLBACK =================
  async githubCallback(req, res) {
    try {
      const user = req.user;
      let roleName = "etudiant";

      if (user.role) {
        const roleDocument = await Role.findById(user.role);
        if (roleDocument) roleName = roleDocument.name;
      }

      const payload = { id: user._id, role: roleName };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleName,
        profilePicture: user.profilePicture
      };

      // Redirect to frontend with token and user data
      const redirectUrl = `http://localhost:5173/oauth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      console.log('GitHub OAuth - Redirect URL:', redirectUrl);
      res.redirect(redirectUrl);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "GitHub login failed" });
    }
  }
}

module.exports = new AuthController();
