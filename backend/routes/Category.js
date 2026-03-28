const express = require("express");
const categoryController = require("../controllers/Category");
const { requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router
    .get("/", categoryController.getAll)
    .post("/", verifyToken, requireAdmin, categoryController.create)
    .patch("/:id", verifyToken, requireAdmin, categoryController.updateById)
    .delete("/:id", verifyToken, requireAdmin, categoryController.deleteById);

module.exports = router;
