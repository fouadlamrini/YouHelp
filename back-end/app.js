const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("./src/config/passport");
const registerRoutes = require("./src/routes");
const notFound = require("./src/middlewares/notFound");
const errorHandler = require("./src/middlewares/errorHandler");

function createApp() {
  const app = express();

  // Core middlewares
  app.use(cors());
  app.use(express.json());
  app.use(passport.initialize());

  // Static files
  app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
  app.use("/avatars", express.static(path.join(__dirname, "src/photo-avatar")));

  // API routes
  registerRoutes(app);

  // Fallback middlewares
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
