const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "SUCCESS" },
  timestamp: { type: Date, default: Date.now },
});

// Check if model already exists. If so, export that; otherwise compile a new model.
module.exports =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
