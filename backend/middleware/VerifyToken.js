require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const unauthorized = (res, message = "Please login to continue") =>
    res.status(401).json({ message });

const buildRequestUser = async (token) => {
    const decodedInfo = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedInfo?._id) {
        return null;
    }

    const user = await User.findById(decodedInfo._id);

    if (!user || user.isBlocked) {
        return null;
    }

    return {
        _id: user._id,
        email: user.email,
        role: user.role || (user.isAdmin ? "admin" : "user"),
        isAdmin: Boolean(user.isAdmin || user.role === "admin"),
        isVerified: Boolean(user.isVerified),
    };
};

exports.verifyToken = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return unauthorized(res);
        }

        const requestUser = await buildRequestUser(token);

        if (!requestUser) {
            return unauthorized(res, "Invalid token");
        }

        req.user = requestUser;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return unauthorized(res, "Token expired, please login again");
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return unauthorized(res, "Invalid token");
        }

        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};

exports.attachUserIfPresent = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next();
        }

        const requestUser = await buildRequestUser(token);
        if (requestUser) {
            req.user = requestUser;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};
