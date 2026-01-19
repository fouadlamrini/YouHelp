const Level = require("../models/Level");
const mongoose = require("mongoose");
require("dotenv").config();


const levels = [
  { name: "Sas" },
  { name: "1A" },
  { name: "2A" },
  { name: "Graduate" }
];

async function seedLevels() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    
    await Level.deleteMany({});

    
    await Level.insertMany(levels);
    console.log("Levels seeded successfully.");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding levels:", error);
  }
}

seedLevels();
