const express = require("express");
const storefrontController = require("../controllers/Storefront");

const router = express.Router();

router.get("/overview", storefrontController.getOverview);

module.exports = router;
