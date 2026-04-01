const Banner = require("../models/Banner");

exports.create = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating banner, please try again later" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.active === "true") {
            filter.isActive = true;
        }

        const banners = await Banner.find(filter).sort({ priority: -1, createdAt: -1 });
        res.status(200).json(banners);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching banners, please try again later" });
    }
};

exports.getById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }
        res.status(200).json(banner);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching banner, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ message: "Banner not found" });
        }
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating banner, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Banner.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Banner not found" });
        }
        res.status(200).json({ message: "Banner deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting banner, please try again later" });
    }
};
