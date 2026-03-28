const Wishlist = require("../models/Wishlist");

const populateWishlist = (query) =>
    query.populate({
        path: "product",
        populate: ["brand", "category"],
    });

exports.create = async (req, res) => {
    try {
        const existing = await Wishlist.findOne({ user: req.user._id, product: req.body.product });

        if (existing) {
            const populated = await populateWishlist(Wishlist.findById(existing._id));
            return res.status(200).json(populated);
        }

        const created = await Wishlist.create({
            user: req.user._id,
            product: req.body.product,
        });

        const populated = await populateWishlist(Wishlist.findById(created._id));
        res.status(201).json(populated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding product to wishlist, please try again later" });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);
        const skip = (page - 1) * limit;

        const result = await populateWishlist(
            Wishlist.find({ user: req.user._id }).skip(skip).limit(limit)
        );
        const totalResults = await Wishlist.countDocuments({ user: req.user._id });

        res.set("X-Total-Count", totalResults);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching your wishlist, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await populateWishlist(
            Wishlist.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
                new: true,
            })
        );
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating your wishlist, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting that product from wishlist, please try again later" });
    }
};
