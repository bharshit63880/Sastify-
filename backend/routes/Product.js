const express = require("express");
const productController = require("../controllers/Product");
const { attachUserIfPresent, requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router
    .get("/", attachUserIfPresent, productController.getAll)
    .get("/:id", productController.getById)
    .post("/", verifyToken, requireAdmin, productController.create)
    .patch("/:id", verifyToken, requireAdmin, productController.updateById)
    .patch("/undelete/:id", verifyToken, requireAdmin, productController.undeleteById)
    .delete("/:id", verifyToken, requireAdmin, productController.deleteById);

module.exports = router;
