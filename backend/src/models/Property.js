import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, maxlength: 4000 },
  type: { type: String, enum: ["Room", "Apartment", "House", "PG"], required: true },
  rent: { type: Number, required: true, min: 0 },
  deposit: { type: Number, default: 0, min: 0 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  area: { type: String, required: true, trim: true, maxlength: 120 },
  address: { type: String, required: true, trim: true, maxlength: 300 },
  bedrooms: { type: Number, default: 1, min: 1, max: 50 },
  furnished: { type: Boolean, default: false },
  amenities: { type: [{ type: String, trim: true, maxlength: 40 }], validate: [(items) => items.length <= 20, "You can add at most 20 amenities"] },
  images: { type: [{ type: String, maxlength: 2048 }], validate: [(items) => items.length <= 5 && items.every((image) => /^https?:\/\//i.test(image) || /^\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/i.test(image)), "Use up to 5 supported image URLs"] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Property", propertySchema);
