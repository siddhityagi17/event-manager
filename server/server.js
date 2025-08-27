import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
// ✅ This mounts your routes at /api/events
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));
