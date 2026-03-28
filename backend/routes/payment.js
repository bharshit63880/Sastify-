const express = require("express");
const paymentController = require("../controllers/Payment");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.get("/config", paymentController.getConfig);
router.post("/create-order", verifyToken, paymentController.createPaymentOrder);
router.post("/verify", verifyToken, paymentController.verifyPayment);

module.exports = router;
