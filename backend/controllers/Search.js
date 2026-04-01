const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const TrendingSearch = require("../models/TrendingSearch");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFuzzyRegex = (query = "") => {
    const tokens = query
        .trim()
        .split(/\s+/)
        .map((token) => escapeRegex(token))
        .filter(Boolean);

    if (!tokens.length) {
        return null;
    }

    return new RegExp(tokens.join(".*"), "i");
};

exports.getSuggestions = async (req, res) => {
    try {
        const query = (req.query.q || "").trim();
        const limit = Math.min(Number(req.query.limit || 6), 12);
        const regex = query.length >= 2 ? buildFuzzyRegex(query) : null;

        const trendingPromise = TrendingSearch.find({})
            .sort({ count: -1, lastSearchedAt: -1 })
            .limit(limit)
            .lean();

        if (query) {
            TrendingSearch.findOneAndUpdate(
                { query: query.toLowerCase() },
                { $inc: { count: 1 }, $set: { lastSearchedAt: new Date() } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).catch(() => null);
        }

        const productsPromise = regex
            ? Product.find({
                  isDeleted: false,
                  status: "active",
                  $or: [
                      { name: { $regex: regex } },
                      { title: { $regex: regex } },
                      { description: { $regex: regex } },
                  ],
              })
                  .select("name title price originalPrice thumbnail images brand category ratingAverage rating ratingCount")
                  .populate("brand", "name")
                  .populate("category", "name")
                  .limit(limit)
                  .lean()
            : Promise.resolve([]);

        const categoriesPromise = regex
            ? Category.find({ isActive: true, name: { $regex: regex } })
                  .select("name slug image")
                  .limit(limit)
                  .lean()
            : Category.find({ isActive: true })
                  .select("name slug image")
                  .limit(limit)
                  .lean();

        const brandsPromise = regex
            ? Brand.find({ isActive: true, name: { $regex: regex } })
                  .select("name slug logo")
                  .limit(limit)
                  .lean()
            : Brand.find({ isActive: true })
                  .select("name slug logo")
                  .limit(limit)
                  .lean();

        const [products, categories, brands, trending] = await Promise.all([
            productsPromise,
            categoriesPromise,
            brandsPromise,
            trendingPromise,
        ]);

        res.status(200).json({
            query,
            products,
            categories,
            brands,
            trending: trending.map((item) => item.query),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error loading search suggestions" });
    }
};
