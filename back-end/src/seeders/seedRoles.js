require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/Role");

const ROLES = [
  { name: "super_admin" },
  { name: "admin" },
  { name: "formateur" },
  { name: "etudiant" },
];

async function seedRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Role.deleteMany({});
    await Role.insertMany(ROLES);
    console.log("Roles seeded successfully.");
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedRoles();
