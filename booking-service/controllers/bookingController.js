const Booking = require("../models/Booking");
const axios = require("axios");
const logger = require("../config/logger");
const amqp = require("amqplib");

// Use environment variables for service endpoints with fallbacks using Docker internal host
const EVENT_SERVICE_URL =
  process.env.EVENT_SERVICE_URL || "http://host.docker.internal:3001";
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://host.docker.internal:3003";
// IMPORTANT: Use the RabbitMQ container name for a consistent connection.
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq";

// Function to publish a message to RabbitMQ
async function publishNotification(message) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = "notificationQueue";
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    logger.info(`publishNotification: Message published to queue: ${queue}`);
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (err) {
    logger.error(
      `publishNotification: Error publishing message - ${err.message}`
    );
  }
}

exports.createBooking = async (req, res) => {
  try {
    const { userId, eventId, tickets, amount } = req.body;
    logger.info(
      `createBooking: Creating booking for user ${userId} for event ${eventId}`
    );

    // 1. Check event availability (Sync call to Event Service)
    const eventResponse = await axios.get(
      `${EVENT_SERVICE_URL}/events/${eventId}/availability`
    );
    const availableTickets = eventResponse.data.availableTickets;
    if (availableTickets < tickets) {
      logger.info(`createBooking: Not enough tickets for event ${eventId}`);
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    // 2. Process payment (Sync call to Payment Service)
    const paymentResponse = await axios.post(
      `${PAYMENT_SERVICE_URL}/payments`,
      {
        userId,
        amount,
      }
    );
    if (paymentResponse.data.status !== "SUCCESS") {
      logger.info(`createBooking: Payment failed for user ${userId}`);
      return res.status(400).json({ error: "Payment failed" });
    }

    // 3. Create the booking
    const booking = new Booking({
      userId,
      eventId,
      tickets,
      amount,
      status: "CONFIRMED",
    });
    await booking.save();
    logger.info(`createBooking: Booking created with id: ${booking._id}`);

    // 4. Publish notification message to RabbitMQ (Asynchronous)
    await publishNotification({
      bookingId: booking._id,
      userId,
      status: "CONFIRMED",
    });
    logger.info(
      `createBooking: Notification published for booking id: ${booking._id}`
    );

    res.status(201).json({ message: "Booking confirmed", booking });
  } catch (err) {
    logger.error(`createBooking: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    logger.info(`getBookingById: Fetching booking with id: ${req.params.id}`);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      logger.info(
        `getBookingById: Booking not found with id: ${req.params.id}`
      );
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    logger.error(`getBookingById: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};
