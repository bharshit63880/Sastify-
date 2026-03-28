const express = require("express");
const cartController = require("../controllers/Cart");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken);

router
    .post("/", cartController.create)
    .get("/user/:id", cartController.getByUserId)
    .get("/me", cartController.getByUserId)
    .patch("/:id", cartController.updateById)
    .delete("/:id", cartController.deleteById)
    .delete("/user/:id", cartController.deleteByUserId)
    .delete("/me", cartController.deleteByUserId);

module.exports = router;
