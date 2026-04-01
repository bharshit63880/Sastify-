const express = require("express");
const storefrontController = require("../controllers/Storefront");

const router = express.Router();

router.get("/overview", storefrontController.getOverview);
router.get("/home", storefrontController.getMarketplaceHome);

module.exports = router;
