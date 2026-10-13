
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    propertyType: {
      type: String,
      enum: ["House", "Apartment", "Land", "Commercial"],
      required: true
    },

    listingType: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true
    },

    bedrooms: {
      type: Number,
      default: 0,
      min: 0
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0
    },

    // Keep compatibility with existing frontend
    image: {
      type: String,
      default: ""
    },

    // Multiple property image URLs
    images: {
      type: [String],
      default: []
    },

    area: {
      type: Number,
      default: 0,
      min: 0
    },

    parking: {
      type: Number,
      default: 0,
      min: 0
    },

    amenities: {
      type: [String],
      default: []
    },

    furnished: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["Available", "Sold", "Rented"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Property", propertySchema);
