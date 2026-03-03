const Role = require("../models/Role");

async function getAll(req, res) {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ success: true, data: roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAll };
