import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "owner"], default: "customer" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
