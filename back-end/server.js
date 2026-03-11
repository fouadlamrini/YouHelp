require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const createApp = require("./app");
const { setupSocket } = require("./src/config/socket");
const { setNotificationEmitter } = require("./src/config/notificationEmitter");

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();
const server = http.createServer(app);

// ======== SOCKET.IO (real-time messages) ========
const { io, emitToUser } = setupSocket(server);
app.set("io", io);
app.set("emitToUser", emitToUser);
setNotificationEmitter(emitToUser);

// ======== START SERVER & CONNECT MONGO ========
async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not defined. Starting without MongoDB connection.");
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

async function start() {
  try {
    await connectDatabase();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
