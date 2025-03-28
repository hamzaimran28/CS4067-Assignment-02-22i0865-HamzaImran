// notification-service/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { sendNotification } = require("../controllers/notificationController");
const Notification = require("../models/Notification");

// POST endpoint: log a notification
router.post("/", sendNotification);

// GET endpoint: fetch notifications by userId
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId query parameter" });
  }
  try {
    const notifications = await Notification.find({ userId });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
