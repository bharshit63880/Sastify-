const Address = require("../models/Address");

exports.create = async (req, res) => {
    try {
        if (req.body.isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const created = await Address.create({
            ...req.body,
            user: req.user._id,
        });

        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding address, please try again later" });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const results = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching addresses, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        if (req.body.isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const updated = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating address, please try again later" });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const deleted = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting address, please try again later" });
    }
};
