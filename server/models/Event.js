import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  location: String,
  attendees: [{ type: String }] // store user emails/names
});

export default mongoose.model("Event", eventSchema);
