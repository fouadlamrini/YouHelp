const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, lowercase: true },
    password: { type: String },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    provider: { type: String, default: "local" },
    googleId: { type: String },
    githubId: { type: String },

    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending'
    }

  },
  { timestamps: true },
);


userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = function (input) {
  return bcrypt.compare(input, this.password);
};

module.exports = mongoose.model("User", userSchema);
