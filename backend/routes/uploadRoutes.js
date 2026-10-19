
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }
  },
});

// Upload a single file to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ceylon-estates/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

// Authentication and OWNER authorization are required.
// Adjust the imports to your existing authMiddleware exports.
const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post(
  "/properties",
  protect,
  allowRoles("OWNER"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Please select at least one image",
        });
      }

      const uploadedImages = await Promise.all(
        req.files.map(uploadToCloudinary)
      );

      return res.status(201).json({
        message: "Images uploaded successfully",
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Upload error:", error);

      return res.status(500).json({
        message: "Image upload failed",
      });
    }
  }
);

// Handle Multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  next();
});

module.exports = router;
