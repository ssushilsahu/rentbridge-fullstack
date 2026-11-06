import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  contactRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ContactRequest" },
  kind: { type: String, enum: ["interest", "accepted", "declined"], required: true },
  message: { type: String, required: true },
  contactEmail: { type: String },
  contactAddress: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
