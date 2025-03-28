// event-service/server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const eventRoutes = require("./routes/eventRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./config/logger");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/events", eventRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Event Service running on port ${PORT}`);
});
