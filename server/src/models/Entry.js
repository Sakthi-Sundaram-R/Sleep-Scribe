import mongoose from "mongoose";

// A single journal/dream entry, owned by a user.
const entrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true },
    date: { type: String }, // pretty display date, e.g. "Jun 24"
    quality: { type: Number, default: 0 }, // 0-100 sleep quality
    hours: { type: Number, default: 0 }, // hours slept
    // AI analysis blob (themes, mood, symbols, tip). Computed client-side for
    // now; will be produced by the LLM on Day 3. Stored as a flexible object.
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

entrySchema.methods.toJSON = function () {
  return {
    id: this._id,
    text: this.text,
    date: this.date,
    quality: this.quality,
    hours: this.hours,
    analysis: this.analysis,
    createdAt: this.createdAt,
  };
};

export const Entry = mongoose.model("Entry", entrySchema);
