const express = require("express");
const Property = require("../models/Property");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ message: "Property route is working!" });
});

// Get all properties
router.get("/", async (req, res) => {
    try {
        const properties = await Property.find();

        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch properties",
            error: error.message,
        });
    }
});
// Get a single property by ID
router.get("/:id", async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json(property);
    } catch (error) {
        res.status(400).json({
            message: "Invalid property ID",
            error: error.message,
        });
    }
});

// Update a property
router.put("/:id", async (req, res) => {
    try {
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json(updatedProperty);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update property",
            error: error.message,
        });
    }
});


// Delete a property
router.delete("/:id", async (req, res) => {
    try {
        const deletedProperty = await Property.findByIdAndDelete(req.params.id);

        if (!deletedProperty) {
            return res.status(404).json({
                message: "Property not found",
            });
        }

        res.status(200).json({
            message: "Property deleted successfully",
            property: deletedProperty,
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete property",
            error: error.message,
        });
    }
});


// Create a new property
router.post("/", async (req, res) => {
    try {
        const property = new Property(req.body);

        const savedProperty = await property.save();

        res.status(201).json(savedProperty);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create property",
            error: error.message,
        });
    }
});

module.exports = router;