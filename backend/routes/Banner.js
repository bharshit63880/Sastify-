const express = require("express");
const bannerController = require("../controllers/Banner");
const { verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.post("/", verifyToken, bannerController.create);
router.get("/", bannerController.getAll);
router.get("/:id", bannerController.getById);
router.patch("/:id", verifyToken, bannerController.updateById);
router.delete("/:id", verifyToken, bannerController.deleteById);

module.exports = router;
