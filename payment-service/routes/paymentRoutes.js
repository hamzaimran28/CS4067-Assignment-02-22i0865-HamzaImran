// payment-service/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/paymentController");
const Payment = require("../models/payment");

// POST endpoint: process a payment
router.post("/", processPayment);

// GET endpoint: fetch payments by userId
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId query parameter" });
  }
  try {
    const payments = await Payment.find({ userId });
    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
