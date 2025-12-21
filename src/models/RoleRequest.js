const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoleRequest", roleRequestSchema);
