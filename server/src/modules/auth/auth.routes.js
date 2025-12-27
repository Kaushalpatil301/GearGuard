const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
