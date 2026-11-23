const express = require("express");
const cors = require("cors");

const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Ceylon Estates Backend is running!");
});

module.exports = app;

