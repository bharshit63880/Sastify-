const User = require("../models/User");
const { sanitizeUser } = require("../utils/SanitizeUser");

exports.getById = async (req, res) => {
    try {
        const userId = req.params.id || req.user?._id;
        if (req.params.id && !req.user?.isAdmin && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this profile" });
        }
        const result = await User.findById(userId);

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(sanitizeUser(result));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting your details, please try again later" });
    }
};

exports.updateById = async (req, res) => {
    try {
        const userId = req.params.id || req.user?._id;
        if (req.params.id && !req.user?.isAdmin && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this profile" });
        }
        const allowedUpdates = {
            name: req.body.name,
            phone: req.body.phone,
            avatarUrl: req.body.avatarUrl,
        };

        const updated = await User.findByIdAndUpdate(userId, allowedUpdates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(sanitizeUser(updated));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating your details, please try again later" });
    }
};
