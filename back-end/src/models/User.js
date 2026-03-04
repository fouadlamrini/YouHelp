const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Role = require("./Role");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true,required: true, lowercase: true },
    password: { type: String },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus",default: null },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class",default: null},
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level",default: null },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    provider: { type: String, default: "local" },
    googleId: { type: String },
    githubId: { type: String },
    profilePicture: { 
      type: String, 
      default: "default-avatar.jpg" 
    },
    coverPicture: { 
      type: String, 
      default: "default-cover.jpg" 
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending'
    },
    completeProfile: { type: Boolean, default: false },
    specialite: { type: String, default: null }

  },
  { timestamps: true },
);


userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.role) {
    const etudiantRole = await Role.findOne({ name: "etudiant" });
    if (etudiantRole) this.role = etudiantRole._id;
  }
});

userSchema.methods.comparePassword = function (input) {
  return bcrypt.compare(input, this.password);
};

module.exports = mongoose.model("User", userSchema);
