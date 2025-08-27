import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  attendees: { type: [String], default: [] },
});

export default mongoose.model("Event", eventSchema);
