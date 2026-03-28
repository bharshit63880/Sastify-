const express = require("express");
const userController = require("../controllers/User");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken);

router
    .get("/me", userController.getById)
    .patch("/me", userController.updateById)
    .get("/:id", userController.getById)
    .patch("/:id", userController.updateById);

module.exports = router;
