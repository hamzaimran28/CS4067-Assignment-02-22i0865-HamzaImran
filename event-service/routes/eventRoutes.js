// event-service/routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  checkAvailability,
  createEvent,
} = require("../controllers/eventController");

// Existing GET endpoints
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.get("/:id/availability", checkAvailability);

// Add a POST endpoint to create an event
router.post("/", createEvent);

module.exports = router;
