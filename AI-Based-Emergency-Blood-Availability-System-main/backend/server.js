import express from "express";
import cors from "cors";

// Checklist Verification Hook
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

console.log("Database & Auth Loading...");

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Global Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Base Domain Root - to prevent "Cannot GET /"
app.get("/", (req, res) => {
  res.send("BloodHub Backend Running Successfully!");
});

// Test Endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api", matchRoutes);
app.use("/api", testRoutes);

// ==========================================
// 3. ML MOCK ROUTES
// ==========================================

// Used by DonorReg.jsx
app.post("/api/predict-donor-response", (req, res) => {
  // Mock standard JSON response
  res.json({ willRespond: true, probability: 0.85 });
});

// Used by BloodRequest.jsx
app.post("/api/predict-priority", (req, res) => {
  res.json({ priority: "CRITICAL", confidence: 0.9 });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
