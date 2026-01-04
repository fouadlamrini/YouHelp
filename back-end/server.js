require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("./src/config/passport");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// ======== MIDDLEWARES ========
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// ======== STATIC UPLOADS ========
// serve images, videos, files
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ======== ROUTES ========
const authRoutes = require("./src/routes/auth.routes");
const requestRole = require("./src/routes/requestRole.routes");
const categoryRoutes = require("./src/routes/category.routes");
const subcategoryRoutes = require("./src/routes/subcategory.routes");
const postRoutes = require("./src/routes/post.routes");
const commentRoutes = require("./src/routes/comment.routes");
const solutionRoutes = require("./src/routes/solution.routes");
const knowledgeRoutes = require("./src/routes/knowledge.routes");
const favoriteRoutes = require("./src/routes/favorite.routes");

app.use("/api/auth", authRoutes);
app.use("/api/requestRole", requestRole);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/solution", solutionRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/favorites", favoriteRoutes);

// ======== START SERVER & CONNECT MONGO ========
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
