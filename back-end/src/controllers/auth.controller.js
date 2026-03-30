const blacklistedTokens = require("../utils/blacklist");
const authService = require("../services/auth.service");

class AuthController {
  oauthSuccess = (req, res) => {
    try {
      console.log("[oauth] oauthSuccess controller hit");
      const authData = req.user;
      if (!authData?.token || !authData?.user) {
        console.error("[oauth] missing token or user in req.user");
        return res.status(401).json({ message: "OAuth authentication failed" });
      }
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const safeUser = authService.formatUserForResponse(authData.user, authData.roleName);
      const redirectUrl =
        `${frontendUrl}/auth/oauth-success` +
        `?token=${encodeURIComponent(authData.token)}` +
        `&user=${encodeURIComponent(JSON.stringify(safeUser))}`;
      console.log("[oauth] redirecting to frontend success");
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  oauthFailure = (_req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?oauth=failed`);
  };

  register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const { user, roleName, token } = result;
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: authService.formatUserForResponse(user, roleName),
          token,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      const { user, roleName, token } = result;
      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          user: authService.formatUserForResponse(user, roleName),
          token,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  logout = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({ message: "No token provided" });
      }
      const token = authService.extractTokenFromHeader(authHeader);
      if (token) blacklistedTokens.add(token);
      return res.status(200).json({
        success: true,
        message: "Logged out successfully. Please remove the token from client.",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  getCompleteProfileOptions = async (req, res) => {
    try {
      const data = await authService.getCompleteProfileOptions();
      return res.json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  completeProfile = async (req, res) => {
    try {
      const result = await authService.completeProfile(req.user.id, req.body);
      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }
      return res.json({ success: true, data: result.data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new AuthController();
