const Campus = require("../models/Campus");
const mongoose = require('mongoose');
require('dotenv').config();

const campuses = [
    { name: "Campus-Nador" },
    { name: "Campus-Safi" },
    { name: "Campus-Youssofia" },
    { name: "Campus-Fes" },
   
];

async function seedCampuses() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await Campus.deleteMany({}); 
        await Campus.insertMany(campuses);
        console.log("Campuses seeded successfully.");

        mongoose.connection.close(); 
    } catch (error) {
        console.error("Error seeding campuses:", error);
    }
}

seedCampuses();
