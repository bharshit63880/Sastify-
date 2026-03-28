const express = require("express");
const orderController = require("../controllers/Order");
const { requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken);

router
    .get("/checkout/preview", orderController.previewCheckout)
    .post("/cod", orderController.createCODOrder)
    .get("/mine", orderController.getMine)
    .get("/:id", orderController.getById)
    .post("/:id/cancel", orderController.cancelMine)
    .get("/", requireAdmin, orderController.getAll)
    .patch("/:id", requireAdmin, orderController.updateById);

module.exports = router;
