const express = require("express");
const mongoose = require("mongoose");

const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({ region: "ap-southeast-2" });

const BUCKET_NAME = "cloudgallery-images-2026";

const upload = multer({
  storage: multer.memoryStorage(),
});

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

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    res.json({
      message: "Upload successful",
      fileName: fileName,
      url: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});
app.get("/images", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });

    const response = await s3.send(command);

    const images = (response.Contents || []).map((item) => ({
      key: item.Key,
      url: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${item.Key}`,
    }));

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve images" });
  }
});

app.listen(80, () => {
  console.log("Server running on port 80");
});
