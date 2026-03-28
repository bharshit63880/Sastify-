const Brand = require("../models/Brand");
const { slugify } = require("../utils/slugify");

exports.create = async (req, res) => {
    try {
        const created = await Brand.create({
            ...req.body,
            slug: req.body.slug ? slugify(req.body.slug) : slugify(req.body.name),
        });
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating brand" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = req.query.admin === "true" ? {} : { isActive: true };
        const result = await Brand.find(filter).sort({ name: 1 });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching brands" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Brand.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                slug: req.body.slug ? slugify(req.body.slug) : undefined,
            },
            { new: true, runValidators: true }
        );
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating brand" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting brand" });
    }
};
