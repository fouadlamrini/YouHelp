require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const passport = require("./src/config/passport");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// routes
const authRoutes = require("./src/routes/auth.routes");
const requestRole=require("./src/routes/requestRole.routes");
const categoryRoutes=require("./src/routes/category.routes");
const subcategoryRoutes=require("./src/routes/subcategory.routes");
app.use("/api/auth", authRoutes);
app.use("/api/requestRole", requestRole);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);


async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
    }

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
