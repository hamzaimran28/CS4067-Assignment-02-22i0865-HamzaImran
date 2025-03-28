// user-service/server.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./config/logger");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined")); // logs requests

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
