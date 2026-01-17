const Role = require("../models/Role");
const mongoose = require("mongoose");
require("dotenv").config();

const roles = [
    { name: "super_admin" },
    { name: "admin" },
     { name: "formateur" },
      { name: "etudiant" }, 
      { name: "visiteur" }];

async function seedRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Role.deleteMany({});
    await Role.insertMany(roles);
    console.log("Roles seeded successfully.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding roles:", error);
  }
}

seedRoles();
