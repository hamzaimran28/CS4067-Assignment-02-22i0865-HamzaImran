const Notification = require("../models/Notification");
const logger = require("../config/logger");

exports.sendNotification = async (req, res) => {
  try {
    const { bookingId, userId, status } = req.body;
    logger.info(
      `sendNotification: Sending notification for booking ${bookingId} to user ${userId} with status ${status}`
    );
    const notificationLog = new Notification({ bookingId, userId, status });
    await notificationLog.save();
    logger.info(
      `sendNotification: Notification logged for booking ${bookingId}`
    );
    res.json({
      message: "Notification sent successfully",
      notification: notificationLog,
    });
  } catch (err) {
    logger.error(`sendNotification: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Notification failed" });
  }
};
