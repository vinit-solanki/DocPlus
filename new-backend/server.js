const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

const app = express()

// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https//localhost:3000", "http://127.0.0.1:5173", "https://docplus-frontend.vercel.app"
],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", JSON.stringify(req.body, null, 2))
  }
  next()
})

// Database connection with better error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB at", process.env.MONGO_URI))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/patients", require("./routes/patients"))
app.use("/api/doctors", require("./routes/doctors"))
app.use("/api/appointments", require("./routes/appointments"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
})

module.exports = app
