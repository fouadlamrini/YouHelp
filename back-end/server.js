require("dotenv").config();
const mongoose = require("mongoose");
const createApp = require("./app");

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

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
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
