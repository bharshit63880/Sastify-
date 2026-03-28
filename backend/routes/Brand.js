const express = require("express");
const brandController = require("../controllers/Brand");
const { requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router
    .get("/", brandController.getAll)
    .post("/", verifyToken, requireAdmin, brandController.create)
    .patch("/:id", verifyToken, requireAdmin, brandController.updateById)
    .delete("/:id", verifyToken, requireAdmin, brandController.deleteById);

module.exports = router;
