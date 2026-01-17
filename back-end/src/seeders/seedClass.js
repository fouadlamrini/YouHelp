const Class = require("../models/Class");
const mongoose = require('mongoose');
require('dotenv').config();

const classes = [
    { name: "LorenzCipher",
        year:2024
     }, 
    { name: "Mernerds",
        year:2025
     }, 
    { name: "Javador",
        year:2025
     }, 
    { name: "DarHamza",
        year:2025
     }, 
];

async function seedClasses() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await Class.deleteMany({}); 
        await Class.insertMany(classes);
        console.log("Classes seeded successfully.");

        mongoose.connection.close(); 
    } catch (error) {
        console.error("Error seeding classes:", error);
    }
}

seedClasses();
