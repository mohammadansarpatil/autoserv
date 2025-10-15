// server/src/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/register
// Body: { name, email, password }
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // 1) Basic input validation (defensive)
    if (!name || !email || !password) {
      const err = new Error("name, email and password are required");
      err.status = 400; // Bad Request
      throw err;
    }

    // 2) Check if email already exists (fast path)
    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      const err = new Error("Email already in use");
      err.status = 409; // Conflict
      throw err;
    }

    // 3) Create a new user and set hashed password
    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
    });

    // Hash the provided password and store hash
    await user.setPassword(String(password)); // may throw if too short

    // 4) Save to DB
    const saved = await user.save();

    // 5) Respond (passwordHash hidden by toJSON transform)
    res.status(201).json({
      message: "Registered successfully",
      user: saved,
    });
  } catch (err) {
    // Handle unique index race (duplicate email) from Mongo
    if (err && err.code === 11000) {
      err = new Error("Email already in use");
      err.status = 409;
    }
    next(err); // goes to centralized error handler
  }
});

module.exports = router;
