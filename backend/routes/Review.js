const express = require("express");
const reviewController = require("../controllers/Review");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router
    .get("/product/:id", reviewController.getByProductId)
    .post("/", verifyToken, reviewController.create)
    .patch("/:id", verifyToken, reviewController.updateById)
    .delete("/:id", verifyToken, reviewController.deleteById);

module.exports = router;
