require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Service = require("./models/Service");


const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/autoserv";

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => console.log("✔ MongoDB connected"))
  .catch((err) => {
    console.error("✖ MongoDB connection error:", err.message);
    process.exit(1); // stop the app if DB is critical
  });

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.get("/api/services", async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ name: 1 })  
      .lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

app.post("/api/echo", (req, res) => {
    const body = req.body;

    if(!body || Object.keys(body).length === 0) {
        return res.status(400).json({ message: "Empty JSON body" });
    }

    res.status(201).json({
        received: body,
        serverTime: new Date().toISOString(),
    })
});

app.get("/api/break", (req, res, next) => {
    throw new Error("Simulated failure in /api/break");
});

function notFound(req, res, next) {
  res.status(404).json({ message: "Not Found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Server Error";
  res.status(status).json({ message });
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});