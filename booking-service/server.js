// booking-service/server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const bookingRoutes = require("./routes/bookingRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./config/logger");

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));

// Middleware to disable caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
