const roleService = require("../services/role.service");

async function getAll(req, res) {
  try {
    const result = await roleService.getAll();
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }
    return res.json({ success: true, data: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAll };
