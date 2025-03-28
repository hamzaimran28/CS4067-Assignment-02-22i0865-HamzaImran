// notification-service/models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
