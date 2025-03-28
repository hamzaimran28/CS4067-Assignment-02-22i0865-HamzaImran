const User = require("../models/User");
const logger = require("../config/logger");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    logger.info(
      `registerUser: Attempting to register user with email: ${email}`
    );
    const newUser = new User({ username, email, password });
    await newUser.save();
    logger.info(
      `registerUser: User registered successfully with id: ${newUser._id}`
    );
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    // Log and return the detailed error message for debugging purposes
    logger.error(`registerUser: Error occurred - ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Login user using username and password
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.info(`loginUser: Attempting login for username: ${username}`);

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      logger.info(`loginUser: User not found for username: ${username}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Check password (plain text for now)
    if (user.password !== password) {
      logger.info(`loginUser: Invalid password for username: ${username}`);
      return res.status(401).json({ error: "Invalid password" });
    }

    logger.info(`loginUser: User ${username} logged in successfully`);
    res.json(user);
  } catch (err) {
    logger.error(`loginUser: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get user profile by id
exports.getUserProfile = async (req, res) => {
  try {
    logger.info(`getUserProfile: Fetching user with id: ${req.params.id}`);
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.info(`getUserProfile: User not found with id: ${req.params.id}`);
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    logger.error(`getUserProfile: Error occurred - ${err.message}`);
    res.status(500).json({ error: "Server Error" });
  }
};
