const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mongoURI = "mongodb://10.0.21.5:27017/cloudgallery";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const ItemSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model("Item", ItemSchema);

app.get("/", (req, res) => {
  res.send("CloudGallery Backend Running (Mongo Connected)");
});

app.post("/test", async (req, res) => {
  const newItem = new Item({ name: "Test Item" });
  await newItem.save();
  res.json({ message: "Test item saved to MongoDB" });
});

app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.listen(80, () => {
  console.log("Server running on port 80");
});
