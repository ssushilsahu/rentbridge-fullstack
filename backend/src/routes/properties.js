import express from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { readFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Property from "../models/Property.js";
import { auth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads"));
mkdirSync(uploadDir, { recursive: true });
const imageTypes = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
async function removeUploadedFiles(files = []) {
  await Promise.all(files.map((file) => unlink(file.path).catch(() => {})));
}

function imageSignatureMatches(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
}

function localImagePath(image) {
  const match = typeof image === "string" && image.match(/^\/uploads\/([a-z0-9-]+\.(?:jpg|png|webp))$/i);
  return match ? path.join(uploadDir, match[1]) : null;
}

async function removeListingImages(images = []) {
  await Promise.all(images.map(localImagePath).filter(Boolean).map((filePath) => unlink(filePath).catch(() => {})));
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => callback(null, `${randomUUID()}${imageTypes[file.mimetype] || ".img"}`)
  }),
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => imageTypes[file.mimetype]
    ? callback(null, true)
    : callback(new Error("Use JPG, PNG, or WebP images"))
});
function parseImageUploads(req, res, next) {
  imageUpload.array("images", 5)(req, res, async (error) => {
    if (error) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : "Use up to 5 JPG, PNG, or WebP images" });
    }
    try {
      for (const file of req.files || []) {
        if (!imageSignatureMatches(await readFile(file.path), file.mimetype)) {
          await removeUploadedFiles(req.files);
          return res.status(400).json({ message: "The uploaded file content does not match its image type" });
        }
      }
      next();
    } catch {
      await removeUploadedFiles(req.files);
      res.status(400).json({ message: "Could not validate the uploaded images" });
    }
  });
}

router.get("/", async (req, res) => {
  try {
    const { city, type, maxRent } = req.query;
    const query = {};
    if (typeof city === "string" && city.trim()) {
      const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ city: new RegExp(escapedCity, "i") }, { area: new RegExp(escapedCity, "i") }];
    }
    if (type) {
      if (!["Room", "Apartment", "House", "PG"].includes(type)) return res.status(400).json({ message: "Invalid property type" });
      query.type = type;
    }
    if (maxRent !== undefined) {
      const amount = Number(maxRent);
      if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: "maxRent must be a non-negative number" });
      query.rent = { $lte: amount };
    }
    const properties = await Property.find(query).select("-address").populate("owner", "name").sort({ createdAt: -1 }).limit(100);
    res.json(properties);
  } catch { res.status(500).json({ message: "Could not load properties" }); }
});

router.get("/mine", auth, async (req, res) => {
  try {
    if (!["customer", "owner"].includes(req.user.role)) return res.status(403).json({ message: "Customer or owner account required" });
    const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch { res.status(500).json({ message: "Could not load your properties" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).select("-address").populate("owner", "name");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch { res.status(500).json({ message: "Could not load this property" }); }
});

router.post("/", auth, rateLimit({ windowMs: 60 * 60 * 1000, max: 20, key: "property-create" }), parseImageUploads, async (req, res) => {
  try {
    if (!["customer", "owner"].includes(req.user.role)) return res.status(403).json({ message: "Customer or owner account required" });
    const fields = ["title", "description", "type", "rent", "deposit", "city", "area", "address", "bedrooms", "furnished", "amenities", "images"];
    const input = Object.fromEntries(fields.filter((key) => key !== "images" && req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    input.images = [
      ...(req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : []),
      ...(req.files || []).map((file) => `/uploads/${file.filename}`)
    ];
    const property = await Property.create({ ...input, owner: req.user.id });
    res.status(201).json(property);
  } catch (e) {
    await removeUploadedFiles(req.files);
    res.status(400).json({ message: e.name === "ValidationError" || e.name === "CastError" ? "Check the property details and try again" : "Could not create this property" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const fields = ["title", "description", "type", "rent", "deposit", "city", "area", "address", "bedrooms", "furnished", "amenities", "images"];
    const input = Object.fromEntries(fields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id }, { $set: input }, { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found or not yours" });
    res.json(property);
  } catch (e) { res.status(400).json({ message: e.name === "ValidationError" || e.name === "CastError" ? "Check the property details and try again" : "Could not update this property" }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!property) return res.status(404).json({ message: "Property not found or not yours" });
    await removeListingImages(property.images);
    res.json({ message: "Property deleted" });
  } catch { res.status(500).json({ message: "Could not delete this property" }); }
});

export default router;
