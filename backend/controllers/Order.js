const Order = require("../models/Order");
const {
    SHIPPING_STATUS_COPY,
    buildTrackingEntry,
    calculateCheckout,
    canCancelOrder,
    createOrderFromCheckout,
} = require("../services/checkout");

exports.createCODOrder = async (req, res) => {
    try {
        const order = await createOrderFromCheckout({
            userId: req.user._id,
            addressId: req.body.addressId,
            couponCode: req.body.couponCode,
            paymentMethod: "cod",
            paymentGateway: "",
            paymentStatus: "cod_pending",
            paymentVerified: false,
            transactionMeta: {
                instructions: "Cash to be collected at delivery",
            },
        });

        res.status(201).json(order);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Error creating an order" });
    }
};

exports.previewCheckout = async (req, res) => {
    try {
        const summary = await calculateCheckout({
            userId: req.user._id,
            addressId: req.query.addressId,
            couponCode: req.query.couponCode,
        });

        res.status(200).json({
            items: summary.items,
            pricing: summary.pricing,
            addressSnapshot: summary.addressSnapshot,
            coupon: summary.coupon,
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ message: error.message || "Error preparing checkout" });
    }
};

exports.getMine = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching orders, please try again later" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const skip = (page - 1) * limit;
        const filter = req.query.status ? { orderStatus: req.query.status } : {};

        const totalDocs = await Order.countDocuments(filter);
        const results = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.header("X-Total-Count", totalDocs);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching orders, please try again later" });
    }
};

exports.getById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching order details" });
    }
};

exports.cancelMine = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!canCancelOrder(order.orderStatus)) {
            return res.status(400).json({ message: "This order can no longer be cancelled" });
        }

        order.orderStatus = "cancelled";
        order.cancellationReason = req.body.reason || "Cancelled by customer";
        order.trackingHistory.push(
            buildTrackingEntry("cancelled", "Order cancelled", SHIPPING_STATUS_COPY.cancelled)
        );
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error cancelling order" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (req.body.orderStatus && req.body.orderStatus !== order.orderStatus) {
            order.orderStatus = req.body.orderStatus;
            order.trackingHistory.push(
                buildTrackingEntry(
                    req.body.orderStatus,
                    req.body.trackingTitle || req.body.orderStatus.replace(/_/g, " "),
                    req.body.trackingDescription || SHIPPING_STATUS_COPY[req.body.orderStatus] || ""
                )
            );
        }

        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        if (Array.isArray(req.body.trackingHistory)) {
            order.trackingHistory = req.body.trackingHistory;
        }

        if (req.body.returnRequested !== undefined) {
            order.returnRequested = Boolean(req.body.returnRequested);
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating order, please try again later" });
    }
};
