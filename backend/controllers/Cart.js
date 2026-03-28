const Cart = require("../models/Cart");

const populateCart = (query) =>
    query.populate({
        path: "product",
        populate: ["brand", "category"],
    });

exports.create = async (req, res) => {
    try {
        const userId = req.user._id;
        const existing = await Cart.findOne({ user: userId, product: req.body.product });

        if (existing) {
            existing.quantity += Number(req.body.quantity || 1);
            await existing.save();
            const populated = await populateCart(Cart.findById(existing._id));
            return res.status(200).json(populated);
        }

        const created = await Cart.create({
            user: userId,
            product: req.body.product,
            quantity: Number(req.body.quantity || 1),
            size: req.body.size || "",
            color: req.body.color || "",
        });

        const populated = await populateCart(Cart.findById(created._id));
        res.status(201).json(populated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding product to cart, please try again later" });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const result = await populateCart(Cart.find({ user: req.user._id }));
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching cart items, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await populateCart(
            Cart.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { quantity: Number(req.body.quantity || 1) },
                { new: true }
            )
        );
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating cart items, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Cart.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting cart item, please try again later" });
    }
};

exports.deleteByUserId = async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user._id });
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some error occurred while resetting your cart" });
    }
};
