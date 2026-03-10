const express = require("express");
const router = express.Router();
const controller = require("../controllers/publicStats.controller");

// Public stats (no auth required)
router.get("/", controller.getStats);

module.exports = router;

