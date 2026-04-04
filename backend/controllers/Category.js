const Category = require("../models/Category");
const { slugify } = require("../utils/slugify");

const buildCategoryPayload = async (payload = {}) => {
    const name = String(payload.name || "").trim();
    const slug = payload.slug ? slugify(payload.slug) : slugify(name);
    const parentId = payload.parentId || null;

    let level = 0;
    let path = slug;

    if (parentId) {
        const parent = await Category.findById(parentId);

        if (!parent) {
            throw new Error("Parent category not found");
        }

        level = Number(parent.level || 0) + 1;
        path = `${parent.path || parent.slug}/${slug}`;
    }

    return {
        ...payload,
        name,
        slug,
        parentId,
        level,
        path,
    };
};

const buildCategoryTree = (categories) => {
    const byId = new Map();
    const roots = [];

    categories.forEach((category) => {
        byId.set(String(category._id), {
            ...category.toObject(),
            children: [],
        });
    });

    byId.forEach((category) => {
        if (category.parentId) {
            const parent = byId.get(String(category.parentId));
            if (parent) {
                parent.children.push(category);
                return;
            }
        }

        roots.push(category);
    });

    const sortNodes = (nodes) => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach((node) => sortNodes(node.children));
    };

    sortNodes(roots);
    return roots;
};

exports.create = async (req, res) => {
    try {
        const created = await Category.create(await buildCategoryPayload(req.body));
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        const message = error.message === "Parent category not found" ? error.message : "Error creating category";
        res.status(500).json({ message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = req.query.admin === "true" ? {} : { isActive: true };
        const result = await Category.find(filter).sort({ level: 1, name: 1 });

        if (req.query.tree === "true") {
            return res.status(200).json(buildCategoryTree(result));
        }

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            await buildCategoryPayload(req.body),
            { new: true, runValidators: true }
        );
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        const message = error.message === "Parent category not found" ? error.message : "Error updating category";
        res.status(500).json({ message });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting category" });
    }
};
