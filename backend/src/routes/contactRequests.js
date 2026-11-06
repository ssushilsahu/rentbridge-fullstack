import express from "express";
import mongoose from "mongoose";
import ContactRequest from "../models/ContactRequest.js";
import Notification from "../models/Notification.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();
router.use(auth);
router.post("/", rateLimit({ windowMs: 60 * 60 * 1000, max: 20, key: "contact-request" }));

router.post("/", async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: "A valid property is required" });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (String(property.owner) === String(req.user.id)) return res.status(400).json({ message: "You cannot request contact for your own listing" });

    const existing = await ContactRequest.findOne({ property: property._id, sender: req.user.id });
    if (existing) return res.status(409).json({ message: `You already sent a request for this listing (${existing.status}).` });

    const request = await ContactRequest.create({ property: property._id, sender: req.user.id, recipient: property.owner });
    await Notification.create({
      recipient: property.owner,
      actor: req.user.id,
      property: property._id,
      contactRequest: request._id,
      kind: "interest",
      message: `${req.user.name || "A customer"} wants to contact you about “${property.title}”.`
    });
    res.status(201).json({ id: request._id, status: request.status, message: "Contact request sent. You’ll be notified when the poster responds." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You already sent a request for this listing." });
    res.status(500).json({ message: "Could not send the contact request." });
  }
});

router.patch("/:id/respond", async (req, res) => {
  try {
    const { decision } = req.body;
    if (!["accepted", "declined"].includes(decision)) return res.status(400).json({ message: "Choose accept or decline" });
    const request = await ContactRequest.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!request) return res.status(404).json({ message: "Contact request not found" });
    if (request.status !== "pending") return res.status(409).json({ message: "This request has already been answered" });

    request.status = decision;
    await request.save();
    const [property, poster] = await Promise.all([
      Property.findById(request.property).select("title address"),
      User.findById(request.recipient).select("name email")
    ]);
    const accepted = decision === "accepted";
    await Promise.all([
      Notification.create({
        recipient: request.sender,
        actor: request.recipient,
        property: request.property,
        contactRequest: request._id,
        kind: decision,
        message: accepted
          ? `Your contact request for “${property?.title || "the listing"}” was accepted.`
          : `Your contact request for “${property?.title || "the listing"}” was declined.`,
        ...(accepted && poster?.email ? { contactEmail: poster.email } : {}),
        ...(accepted && property?.address ? { contactAddress: property.address } : {})
      }),
      Notification.updateMany({ contactRequest: request._id, recipient: request.recipient }, { $set: { isRead: true } })
    ]);
    res.json({ id: request._id, status: request.status });
  } catch (error) {
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({ message: "Could not respond to this request." });
  }
});

export default router;
