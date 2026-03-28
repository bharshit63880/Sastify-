const Coupon = require("../models/Coupon");

exports.create = async (req, res) => {
    try {
        const created = await Coupon.create({
            ...req.body,
            code: req.body.code?.trim().toUpperCase(),
        });
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating coupon" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = req.user?.isAdmin ? {} : { active: true };
        const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching coupons" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                code: req.body.code ? req.body.code.trim().toUpperCase() : undefined,
            },
            { new: true, runValidators: true }
        );
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating coupon" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting coupon" });
    }
};
