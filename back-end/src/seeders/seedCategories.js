const Category = require("../models/Category");
const mongoose = require('mongoose');
require('dotenv').config();

const categories = [
    { name: "front-end" },
    { name: "back-end" },
    { name: "deploiment" },
    { name: "design" },
    { name: "database" },
    { name: "Dev-Ops" },
    { name: "planification" },
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await Category.deleteMany({}); 
        await Category.insertMany(categories);
        console.log("Categories seeded successfully.");

        mongoose.connection.close(); 
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
}

seedCategories();
