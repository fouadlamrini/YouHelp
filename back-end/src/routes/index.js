const authRoutes = require("./auth.routes");
const campusRoutes = require("./campus.routes");
const classRoutes = require("./class.routes");
const levelRoutes = require("./level.routes");
const userRoutes = require("./user.routes");
const roleRoutes = require("./role.routes");
const messageRoutes = require("./message.routes");
const workshopRoutes = require("./workshop.routes");
const friendRoutes = require("./friend.routes");
const friendRequestRoutes = require("./friendRequest.routes");
const categoryRoutes = require("./category.routes");
const subcategoryRoutes = require("./subcategory.routes");
const postRoutes = require("./post.routes");
const commentRoutes = require("./comment.routes");
const solutionRoutes = require("./solution.routes");
const favoriteRoutes = require("./favorite.routes");
const avatarRoutes = require("./avatar.routes");
const statsRoutes = require("./stats.routes");
const publicStatsRoutes = require("./publicStats.routes");
const notificationRoutes = require("./notification.routes");

function registerRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/campus", campusRoutes);
  app.use("/api/class", classRoutes);
  app.use("/api/level", levelRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/roles", roleRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/workshops", workshopRoutes);
  app.use("/api/friends", friendRoutes);
  app.use("/api/friend-requests", friendRequestRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/subcategory", subcategoryRoutes);
  app.use("/api/post", postRoutes);
  app.use("/api/comment", commentRoutes);
  app.use("/api/solution", solutionRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/avatars", avatarRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/public-stats", publicStatsRoutes);
  app.use("/api/notifications", notificationRoutes);
}

module.exports = registerRoutes;
