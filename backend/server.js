import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './mongodb.js';
import connectCloudinary from './cloudinary.js';
import adminRouter from './routes/admin.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Create app
const app = express();
connectDB();
connectCloudinary();
// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serves frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/', (req, res) => res.send("Home"));

app.use('/api/admin', adminRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
