// booking-service/models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    tickets: { type: Number, required: true },
    status: { type: String, default: "PENDING" },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
