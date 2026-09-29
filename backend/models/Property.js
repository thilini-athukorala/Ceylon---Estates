const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        propertyType: {
            type: String,
            enum: ["House", "Apartment", "Land", "Commercial"],
            required: true,
        },

        listingType: {
            type: String,
            enum: ["Sale", "Rent"],
            required: true,
        },

        bedrooms: {
            type: Number,
            default: 0,
        },

        bathrooms: {
            type: Number,
            default: 0,
        },

        image: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Property", propertySchema);