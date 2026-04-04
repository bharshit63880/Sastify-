const Product = require("../models/Product");
const Review = require("../models/Review");
const mongoose = require("mongoose");

const resolveProductId = async (productIdentifier) => {
    if (mongoose.Types.ObjectId.isValid(productIdentifier)) {
        return productIdentifier;
    }

    const product = await Product.findOne({ slug: productIdentifier }).select("_id");
    return product?._id || null;
};

const syncProductReviewSummary = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product: productId, status: "published" } },
        {
            $group: {
                _id: "$product",
                rating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    const summary = stats[0] || { rating: 0, reviewCount: 0 };
    await Product.findByIdAndUpdate(productId, {
        rating: Number((summary.rating || 0).toFixed(1)),
        reviewCount: summary.reviewCount || 0,
    });
};

exports.create = async (req, res) => {
    try {
        const created = await Review.create({
            ...req.body,
            user: req.user._id,
        });

        const populated = await Review.findById(created._id).populate("user", "-password");
        await syncProductReviewSummary(created.product);
        res.status(201).json(populated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error posting review, please try again later" });
    }
};

exports.getByProductId = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const skip = (page - 1) * limit;
        const productId = await resolveProductId(req.params.id);

        if (!productId) {
            res.set("X-Total-Count", 0);
            return res.status(200).json([]);
        }

        const totalDocs = await Review.countDocuments({ product: productId, status: "published" });
        const result = await Review.find({ product: productId, status: "published" })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("user", "-password");

        res.set("X-Total-Count", totalDocs);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting reviews for this product, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Review.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        ).populate("user", "-password");

        await syncProductReviewSummary(updated.product);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating review, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (deleted) {
            await syncProductReviewSummary(deleted.product);
        }
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting review, please try again later" });
    }
};
