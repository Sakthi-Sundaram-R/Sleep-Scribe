import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Dreamer" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional: Google-only accounts have no password.
    passwordHash: { type: String },
    googleId: { type: String, index: true, sparse: true },
    avatar: { type: String },
    // Weekly "sleep coach" digest email — opt-out (default: receive it).
    weeklyEmailOptOut: { type: Boolean, default: false },
    // Password reset (hashed token + expiry).
    resetTokenHash: { type: String },
    resetTokenExp: { type: Date },
  },
  { timestamps: true }
);

// Never leak the password hash to the client.
userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    weeklyEmailOptOut: Boolean(this.weeklyEmailOptOut),
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
