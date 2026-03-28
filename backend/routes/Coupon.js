const express = require("express");
const couponController = require("../controllers/Coupon");
const { attachUserIfPresent, requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router
    .get("/", attachUserIfPresent, couponController.getAll)
    .post("/", verifyToken, requireAdmin, couponController.create)
    .patch("/:id", verifyToken, requireAdmin, couponController.updateById)
    .delete("/:id", verifyToken, requireAdmin, couponController.deleteById);

module.exports = router;
