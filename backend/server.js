const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const propertyRoutes = require("./routes/propertyRoutes");
console.log("Property routes loaded!");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertyRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// Home route
app.get("/", (req, res) => {
    res.send("Ceylon Estates Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});