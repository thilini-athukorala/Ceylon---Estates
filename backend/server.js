const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const app = express();
const uploadRoutes = require("./routes/uploadRoutes");

app.use(cors());
app.use(express.json());
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use("/api/upload", uploadRoutes);
app.get('/', (_req,res) => res.send('Ceylon Estates Backend is running!'));
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
 console.log('MongoDB connected successfully!');
 app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => { console.error('MongoDB connection failed:', err.message); process.exitCode = 1; });
