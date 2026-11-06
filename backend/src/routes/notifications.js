import express from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("actor", "name")
      .populate("property", "title")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch {
    res.status(500).json({ message: "Could not load notifications." });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "Could not update notifications." });
  }
});

export default router;
