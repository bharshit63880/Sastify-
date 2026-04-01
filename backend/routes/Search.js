const express = require("express");
const { getSuggestions } = require("../controllers/Search");

const router = express.Router();

router.get("/suggestions", getSuggestions);

module.exports = router;
