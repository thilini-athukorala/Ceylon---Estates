
const express = require("express");
const mongoose = require("mongoose");
const Property = require("../models/Property");

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Property API is working!"
  });
});

// Escape special characters in search text
const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// GET ALL PROPERTIES + ADVANCED FILTERS
router.get("/", async (req, res) => {
  try {
    const {
      search,
      location,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      sort
    } = req.query;

    const filter = {};

    // Search title, description and location
    if (search) {
      const keyword = escapeRegex(search);

      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } }
      ];
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: escapeRegex(location),
        $options: "i"
      };
    }

    // Property type filter
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Sale or Rent filter
    if (listingType) {
      filter.listingType = listingType;
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        const min = Number(minPrice);

        if (!Number.isFinite(min) || min < 0) {
          return res.status(400).json({
            message: "Invalid minimum price"
          });
        }

        filter.price.$gte = min;
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        const max = Number(maxPrice);

        if (!Number.isFinite(max) || max < 0) {
          return res.status(400).json({
            message: "Invalid maximum price"
          });
        }

        filter.price.$lte = max;
      }
    }

    // Minimum bedrooms
    if (bedrooms !== undefined && bedrooms !== "") {
      const count = Number(bedrooms);

      if (!Number.isInteger(count) || count < 0) {
        return res.status(400).json({
          message: "Invalid bedroom count"
        });
      }

      filter.bedrooms = { $gte: count };
    }

    // Minimum bathrooms
    if (bathrooms !== undefined && bathrooms !== "") {
      const count = Number(bathrooms);

      if (!Number.isInteger(count) || count < 0) {
        return res.status(400).json({
          message: "Invalid bathroom count"
        });
      }

      filter.bathrooms = { $gte: count };
    }

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 }
    };

    const properties = await Property.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest);

    res.status(200).json(properties);

  } catch (error) {
    console.error("Fetch properties error:", error);

    res.status(500).json({
      message: "Failed to fetch properties"
    });
  }
});

// GET SINGLE PROPERTY
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID"
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    res.status(200).json(property);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch property"
    });
  }
});

// CREATE PROPERTY
router.post("/", async (req, res) => {
  try {
    const property = new Property(req.body);

    const savedProperty = await property.save();

    res.status(201).json(savedProperty);

  } catch (error) {
    res.status(400).json({
      message: "Failed to create property",
      error: error.message
    });
  }
});

// UPDATE PROPERTY
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID"
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    res.status(200).json(updatedProperty);

  } catch (error) {
    res.status(400).json({
      message: "Failed to update property",
      error: error.message
    });
  }
});

// DELETE PROPERTY
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid property ID"
      });
    }

    const deletedProperty = await Property.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProperty) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    res.status(200).json({
      message: "Property deleted successfully",
      property: deletedProperty
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete property"
    });
  }
});

module.exports = router;
