const Role = require("../models/Role");

async function getAll() {
  const roles = await Role.find().sort({ name: 1 });
  return { data: roles };
}

module.exports = { getAll };
