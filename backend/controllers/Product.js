const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { slugify } = require("../utils/slugify");

const parseArrayFilter = (value) => {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
};

const parseBoolean = (value) => {
    if (value === undefined) {
        return undefined;
    }

    return ["true", "1", true].includes(value);
};

const buildPublicProductFilter = (query = {}, isAdminRequest = false) => {
    const filter = {};
    const categories = parseArrayFilter(query.category);
    const brands = parseArrayFilter(query.brand);

    if (!isAdminRequest) {
        filter.isDeleted = false;
        filter.status = "active";
    }

    if (categories.length) {
        filter.category = { $in: categories };
    }

    if (brands.length) {
        filter.brand = { $in: brands };
    }

    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: "i" } },
            { title: { $regex: query.search, $options: "i" } },
            { description: { $regex: query.search, $options: "i" } },
        ];
    }

    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) {
            filter.price.$gte = Number(query.minPrice);
        }
        if (query.maxPrice) {
            filter.price.$lte = Number(query.maxPrice);
        }
    }

    if (query.rating) {
        const ratingValue = Number(query.rating);
        filter.$or = [
            ...(filter.$or || []),
            { rating: { $gte: ratingValue } },
            { ratingAverage: { $gte: ratingValue } },
        ];
    }

    if (parseBoolean(query.inStock)) {
        filter.stock = { $gt: 0 };
    }

    if (query.discount) {
        filter.discountPercent = { $gte: Number(query.discount) };
    }

    if (query.featured) {
        filter.featured = parseBoolean(query.featured);
    }

    if (query.trending || query.isTrending) {
        const flag = parseBoolean(query.trending ?? query.isTrending);
        filter.$or = [
            ...(filter.$or || []),
            { trending: flag },
            { isTrending: flag },
        ];
    }

    if (query.bestseller || query.isBestSeller) {
        const flag = parseBoolean(query.bestseller ?? query.isBestSeller);
        filter.$or = [
            ...(filter.$or || []),
            { bestseller: flag },
            { isBestSeller: flag },
        ];
    }

    if (query.isDealOfDay) {
        filter.isDealOfDay = parseBoolean(query.isDealOfDay);
    }

    if (query.slug) {
        filter.slug = query.slug;
    }

    return filter;
};

const buildSort = (query = {}) => {
    const sortMap = {
        relevance: { featured: -1, createdAt: -1 },
        newest: { createdAt: -1 },
        "price-asc": { price: 1 },
        "price-desc": { price: -1 },
        rating: { ratingAverage: -1, rating: -1, ratingCount: -1 },
        discount: { discountPercent: -1 },
        sales: { salesCount: -1, createdAt: -1 },
    };

    if (query.sort && sortMap[query.sort]) {
        return sortMap[query.sort];
    }

    if (query.sort && query.order) {
        return { [query.sort]: query.order === "asc" ? 1 : -1 };
    }

    return sortMap.relevance;
};

const normalizePayload = (payload = {}) => {
    const name = payload.name || payload.title || "";
    const price = Number(payload.price || 0);
    const originalPrice = Number(payload.originalPrice || payload.price || 0);
    const stock = Number(payload.stock ?? payload.stockQuantity ?? 0);
    const images = Array.isArray(payload.images)
        ? payload.images.filter(Boolean)
        : typeof payload.images === "string"
          ? payload.images.split(",").map((item) => item.trim()).filter(Boolean)
          : [];
    const highlights = Array.isArray(payload.highlights)
        ? payload.highlights.filter(Boolean)
        : typeof payload.highlights === "string"
          ? payload.highlights.split("\n").map((item) => item.trim()).filter(Boolean)
          : [];
    const colors = Array.isArray(payload.colors)
        ? payload.colors.filter(Boolean)
        : typeof payload.colors === "string"
          ? payload.colors.split(",").map((item) => item.trim()).filter(Boolean)
          : [];
    const sizes = Array.isArray(payload.sizes)
        ? payload.sizes.filter(Boolean)
        : typeof payload.sizes === "string"
          ? payload.sizes.split(",").map((item) => item.trim()).filter(Boolean)
          : [];

    const specs = Array.isArray(payload.specs)
        ? payload.specs.filter((item) => item?.label && item?.value)
        : [];

    return {
        ...payload,
        name,
        title: name,
        slug: payload.slug ? slugify(payload.slug) : slugify(name),
        price,
        originalPrice,
        stock,
        stockQuantity: stock,
        images,
        thumbnail: payload.thumbnail || images[0] || "",
        highlights,
        colors,
        sizes,
        specs,
        status: payload.status || "active",
        featured: Boolean(payload.featured),
        trending: Boolean(payload.trending ?? payload.isTrending),
        bestseller: Boolean(payload.bestseller ?? payload.isBestSeller),
        isTrending: Boolean(payload.isTrending ?? payload.trending),
        isBestSeller: Boolean(payload.isBestSeller ?? payload.bestseller),
        isDealOfDay: Boolean(payload.isDealOfDay),
        salesCount: Number(payload.salesCount || 0),
        ratingAverage: Number(payload.ratingAverage ?? payload.rating ?? 0),
        ratingCount: Number(payload.ratingCount ?? payload.reviewCount ?? 0),
    };
};

const appendReviewSummary = async (product) => {
    const reviewStats = await Review.aggregate([
        { $match: { product: product._id, status: "published" } },
        {
            $group: {
                _id: "$product",
                rating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    const stats = reviewStats[0] || {
        rating: product.ratingAverage || product.rating || 0,
        reviewCount: product.ratingCount || product.reviewCount || 0,
    };

    if (
        product.rating !== stats.rating ||
        product.reviewCount !== stats.reviewCount ||
        product.ratingAverage !== stats.rating ||
        product.ratingCount !== stats.reviewCount
    ) {
        await Product.findByIdAndUpdate(product._id, {
            rating: Number((stats.rating || 0).toFixed(1)),
            reviewCount: stats.reviewCount || 0,
            ratingAverage: Number((stats.rating || 0).toFixed(1)),
            ratingCount: stats.reviewCount || 0,
        });
    }
};

exports.create = async (req, res) => {
    try {
        const product = await Product.create(normalizePayload(req.body));
        const created = await Product.findById(product._id).populate("brand").populate("category");
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding product, please try again later" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const isAdminRequest = Boolean(req.user?.isAdmin && req.query.admin === "true");
        const filter = buildPublicProductFilter(req.query, isAdminRequest);
        const sort = buildSort(req.query);
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 12);
        const skip = (page - 1) * limit;

        const totalDocs = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate("brand")
            .populate("category")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.set("X-Total-Count", totalDocs);
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching products, please try again later" });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
        const product = await Product.findOne(filter).populate("brand").populate("category");

        if (!product || product.isDeleted || product.status === "inactive") {
            return res.status(404).json({ message: "Product not found" });
        }

        await appendReviewSummary(product);

        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category?._id,
            isDeleted: false,
            status: "active",
        })
            .populate("brand")
            .limit(8);

        res.status(200).json({
            ...product.toObject(),
            relatedProducts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting product details, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, normalizePayload(req.body), {
            new: true,
            runValidators: true,
        })
            .populate("brand")
            .populate("category");

        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating product, please try again later" });
    }
};

exports.undeleteById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isDeleted: false, status: "active" },
            { new: true }
        )
            .populate("brand")
            .populate("category");

        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error restoring product, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, status: "inactive" },
            { new: true }
        )
            .populate("brand")
            .populate("category");

        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting product, please try again later" });
    }
};
