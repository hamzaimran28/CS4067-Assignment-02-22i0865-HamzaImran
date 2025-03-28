const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUserProfile,
  loginUser,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser); // new login route
router.get("/:id", getUserProfile);

module.exports = router;
