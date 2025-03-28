// booking-service/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookingById,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/:id", getBookingById);

module.exports = router;
