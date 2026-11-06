import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

contactRequestSchema.index({ property: 1, sender: 1 }, { unique: true });

export default mongoose.model("ContactRequest", contactRequestSchema);
