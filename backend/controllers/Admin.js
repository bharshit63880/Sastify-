const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardOverview = async (req, res) => {
    try {
        const [totalUsers, totalOrders, totalProducts, lowStockProducts, recentOrders] = await Promise.all([
            User.countDocuments({}),
            Order.countDocuments({}),
            Product.countDocuments({ isDeleted: false }),
            Product.find({ stock: { $lte: 10 }, isDeleted: false }).limit(10).sort({ stock: 1 }),
            Order.find({}).sort({ createdAt: -1 }).limit(8),
        ]);

        const salesAggregate = await Order.aggregate([
            { $match: { paymentStatus: { $in: ["paid", "cod_pending"] } } },
            { $group: { _id: null, totalSales: { $sum: "$pricing.total" } } },
        ]);

        const activeCoupons = await Coupon.countDocuments({ active: true });

        res.status(200).json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalSales: salesAggregate[0]?.totalSales || 0,
            activeCoupons,
            lowStockProducts,
            recentOrders,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching dashboard overview" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            {
                isBlocked: Boolean(req.body.isBlocked),
                role: req.body.role || undefined,
                isAdmin: req.body.role ? req.body.role === "admin" : undefined,
            },
            { new: true, runValidators: true, select: "-password" }
        );

        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user status" });
    }
};
