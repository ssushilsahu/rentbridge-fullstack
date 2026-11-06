import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: "auth" });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", authRateLimit, async (req, res) => {
  try {
    const body = req.body || {};
    const { name, password, role = "customer" } = body;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (typeof name !== "string" || !name.trim() || name.trim().length > 80 || !email || email.length > 254 || !emailPattern.test(email) || typeof password !== "string") {
      return res.status(400).json({ message: "Enter a name (up to 80 characters), a valid email, and a password" });
    }
    if (password.length < 12 || password.length > 128) return res.status(400).json({ message: "Password must be 12 to 128 characters" });
    if (!["customer", "owner"].includes(role)) return res.status(400).json({ message: "Account type must be customer or owner" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      name: name.trim(), email, role,
      password: await bcrypt.hash(password, 12)
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Email already registered" });
    res.status(500).json({ message: "Could not create the account" });
  }
});

router.post("/login", authRateLimit, async (req, res) => {
  try {
    const body = req.body || {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const { password } = body;
    if (!email || typeof password !== "string" || password.length > 128) return res.status(401).json({ message: "Invalid email or password" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (user.role === "tenant") {
      user.role = "customer";
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ message: "Could not log in" });
  }
});

export default router;
