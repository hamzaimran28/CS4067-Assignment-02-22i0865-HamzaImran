// payment-service/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
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

app.use("/payments", paymentRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
