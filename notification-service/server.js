const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const amqp = require("amqplib");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");
const logger = require("./config/logger");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));

app.use("/notifications", notificationRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
  // Start consuming messages asynchronously from RabbitMQ
  consumeNotifications();
});

// Consumer function to receive and save messages from RabbitMQ
async function consumeNotifications() {
  try {
    // Use the internal Docker Compose hostname for RabbitMQ
    const RABBITMQ_URL =
      process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq";
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = "notificationQueue";
    await channel.assertQueue(queue, { durable: true });
    logger.info(
      `consumeNotifications: Waiting for messages in queue: ${queue}`
    );

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        logger.info(
          `consumeNotifications: Received message: ${JSON.stringify(message)}`
        );
        // Save the notification to MongoDB
        try {
          const Notification = require("./models/Notification");
          const newNotification = new Notification({
            bookingId: message.bookingId,
            userId: message.userId,
            status: message.status,
            timestamp: new Date(),
          });
          await newNotification.save();
          logger.info(
            `consumeNotifications: Notification saved for booking ${message.bookingId}`
          );
        } catch (error) {
          logger.error(
            `consumeNotifications: Failed to save notification - ${error.message}`
          );
        }
        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.error(
      `consumeNotifications: Error in consuming messages - ${err.message}`
    );
  }
}
