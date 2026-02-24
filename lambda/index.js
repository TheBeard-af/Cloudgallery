const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const sharp = require("sharp");

const s3 = new S3Client({ region: "ap-southeast-2" });

const SOURCE_BUCKET = "cloudgallery-images-2026";
const DEST_BUCKET = "cloudgallery-thumbnails-2026";

exports.handler = async (event) => {
  try {
    const record = event.Records[0];
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log("Processing file:", key);

    // Skip if not an image
    if (!key.match(/\.(jpg|jpeg|png|webp)$/i)) {
      console.log("Not an image. Skipping.");
      return;
    }

    // Get original image
    const getCommand = new GetObjectCommand({
      Bucket: SOURCE_BUCKET,
      Key: key,
    });

    const originalImage = await s3.send(getCommand);
    const imageBuffer = await streamToBuffer(originalImage.Body);

    // Resize image to thumbnail (200px width)
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize({ width: 200 })
      .toBuffer();

    const thumbnailKey = `thumb-${key}`;

    // Upload thumbnail
    const putCommand = new PutObjectCommand({
      Bucket: DEST_BUCKET,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: "image/png",
    });

    await s3.send(putCommand);

    console.log("Thumbnail created:", thumbnailKey);
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

// Helper function
const streamToBuffer = async (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
