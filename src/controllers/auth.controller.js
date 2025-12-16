const User = require("../models/User");
const { signToken } = require("../config/jwt");

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });

    const token = signToken({ id: user._id, role: user.role });
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const matched = await user.comparePassword(password);
    if (!matched)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role } });
}

module.exports = {
  register,
  login,
  me,
};
