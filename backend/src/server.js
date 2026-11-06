import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import contactRequestRoutes from "./routes/contactRequests.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();
const app = express();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

if (!mongoUri) throw new Error("MONGODB_URI is required");
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === "replace_with_at_least_32_random_characters") {
  throw new Error("Set JWT_SECRET to a private random value of at least 32 characters");
}
if (isProduction && !process.env.CLIENT_ORIGINS) throw new Error("CLIENT_ORIGINS is required in production");
if (isProduction && !process.env.UPLOAD_DIR) throw new Error("Set UPLOAD_DIR to a persistent storage path in production");
if (!allowedOrigins.length || allowedOrigins.some((origin) => {
  try { const parsed = new URL(origin); return parsed.origin !== origin || (isProduction && parsed.protocol !== "https:"); }
  catch { return true; }
})) throw new Error("CLIENT_ORIGINS must be a comma-separated list of valid origins (HTTPS in production)");

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
app.set("trust proxy", trustProxyHops);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  });
  if (isProduction) res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600
}));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads")), {
  maxAge: "7d",
  immutable: true,
  dotfiles: "deny",
  index: false,
  setHeaders(res) { res.set("X-Content-Type-Options", "nosniff"); }
}));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "RentBridge API", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
app.get("/api/ready", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ ok: databaseReady });
});
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/contact-requests", contactRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Request failed:", error.message);
  res.status(500).json({ message: "An unexpected server error occurred" });
});

const port = process.env.PORT || 5000;

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    const server = app.listen(port, () => console.log(`API listening on port ${port}`));
    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.on(signal, () => server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      }));
    }
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
