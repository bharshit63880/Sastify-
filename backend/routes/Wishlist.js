const express = require("express");
const wishlistController = require("../controllers/Wishlist");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken);

router
    .post("/", wishlistController.create)
    .get("/user/:id", wishlistController.getByUserId)
    .get("/me", wishlistController.getByUserId)
    .patch("/:id", wishlistController.updateById)
    .delete("/:id", wishlistController.deleteById);

module.exports = router;
