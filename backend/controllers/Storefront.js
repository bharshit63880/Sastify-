const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");

exports.getOverview = async (req, res) => {
    try {
        const [
            activeProducts,
            activeCategories,
            activeBrands,
            totalOrders,
            inStockProducts,
            reviewAggregate,
            categoryBreakdown,
            brandBreakdown,
            testimonialReviews,
        ] = await Promise.all([
            Product.countDocuments({ isDeleted: false, status: "active" }),
            Category.countDocuments({ isActive: true }),
            Brand.countDocuments({ isActive: true }),
            Order.countDocuments({}),
            Product.countDocuments({ isDeleted: false, status: "active", stock: { $gt: 0 } }),
            Review.aggregate([
                { $match: { status: "published" } },
                {
                    $group: {
                        _id: null,
                        publishedReviews: { $sum: 1 },
                        averageRating: { $avg: "$rating" },
                    },
                },
            ]),
            Product.aggregate([
                { $match: { isDeleted: false, status: "active" } },
                { $group: { _id: "$category", productCount: { $sum: 1 } } },
            ]),
            Product.aggregate([
                { $match: { isDeleted: false, status: "active" } },
                { $group: { _id: "$brand", productCount: { $sum: 1 } } },
            ]),
            Review.find({ status: "published", comment: { $ne: "" }, rating: { $gte: 4 } })
                .sort({ rating: -1, createdAt: -1 })
                .limit(6)
                .populate("user", "name")
                .populate("product", "name slug"),
        ]);

        const categoryCounts = categoryBreakdown.reduce((acc, entry) => {
            acc[entry._id?.toString()] = entry.productCount;
            return acc;
        }, {});

        const brandCounts = brandBreakdown.reduce((acc, entry) => {
            acc[entry._id?.toString()] = entry.productCount;
            return acc;
        }, {});

        const reviewStats = reviewAggregate[0] || { publishedReviews: 0, averageRating: 0 };

        res.status(200).json({
            metrics: {
                activeProducts,
                activeCategories,
                activeBrands,
                totalOrders,
                inStockProducts,
                publishedReviews: reviewStats.publishedReviews || 0,
                averageRating: Number((reviewStats.averageRating || 0).toFixed(1)),
            },
            categoryCounts,
            brandCounts,
            testimonials: testimonialReviews.map((review) => ({
                _id: review._id,
                customerName: review.user?.name || "Verified customer",
                comment: review.comment,
                rating: review.rating,
                productName: review.product?.name || "",
                productSlug: review.product?.slug || review.product?._id?.toString() || "",
                createdAt: review.createdAt,
            })),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching storefront overview" });
    }
};
