import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new event
router.post("/", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update event
router.put("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated event
      runValidators: true, // validate schema
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RSVP
router.post("/:id/rsvp", async (req, res) => {
  const { id } = req.params;
  const { attendee } = req.body;
  const event = await Event.findById(id);
  event.attendees.push(attendee);
  await event.save();
  res.json(event);
});

export default router;
