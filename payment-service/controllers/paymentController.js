const Payment = require("../models/payment");
const logger = require("../config/logger");

exports.processPayment = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    logger.info(
      `processPayment: Processing payment for user ${userId} of amount ${amount}`
    );
    // Simulate successful payment processing
    const paymentLog = new Payment({ userId, amount, status: "SUCCESS" });
    await paymentLog.save();
    logger.info(
      `processPayment: Payment processed successfully with id: ${paymentLog._id}`
    );
    res.json({
      status: "SUCCESS",
      message: "Payment processed successfully",
      payment: paymentLog,
    });
  } catch (err) {
    logger.error(`processPayment: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Payment failed" });
  }
};
