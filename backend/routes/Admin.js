const express = require("express");
const adminController = require("../controllers/Admin");
const { requireAdmin, verifyToken } = require("../middleware/VerifyToken");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/overview", adminController.getDashboardOverview);
router.get("/users", adminController.getUsers);
router.patch("/users/:id", adminController.updateUserStatus);

module.exports = router;
