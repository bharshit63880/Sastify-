const express = require("express");
const addressController = require("../controllers/Address");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken);

router
    .post("/", addressController.create)
    .get("/user/:id", addressController.getByUserId)
    .get("/me", addressController.getByUserId)
    .patch("/:id", addressController.updateById)
    .delete("/:id", addressController.deleteById);

module.exports = router;
