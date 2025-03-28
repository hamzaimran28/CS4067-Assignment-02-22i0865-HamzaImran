const Event = require("../models/Event");
const logger = require("../config/logger");

exports.getAllEvents = async (req, res) => {
  try {
    logger.info("getAllEvents: Fetching all events");
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    logger.error(`getAllEvents: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    logger.info(`getEventById: Fetching event with id: ${req.params.id}`);
    const event = await Event.findById(req.params.id);
    if (!event) {
      logger.info(`getEventById: Event not found with id: ${req.params.id}`);
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    logger.error(`getEventById: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    logger.info(
      `checkAvailability: Checking availability for event id: ${req.params.id}`
    );
    const event = await Event.findById(req.params.id);
    if (!event) {
      logger.info(
        `checkAvailability: Event not found with id: ${req.params.id}`
      );
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ availableTickets: event.availableTickets });
  } catch (err) {
    logger.error(`checkAvailability: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { name, date, venue, availableTickets } = req.body;
    logger.info(`createEvent: Creating event with name: ${name}`);
    const event = new Event({ name, date, venue, availableTickets });
    await event.save();
    logger.info(
      `createEvent: Event created successfully with id: ${event._id}`
    );
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    logger.error(`createEvent: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};
