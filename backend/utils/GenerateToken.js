require("dotenv").config();
const jwt = require("jsonwebtoken");

const DEFAULT_LOGIN_EXPIRATION = "7d";
const DEFAULT_PASSWORD_RESET_EXPIRATION = "15m";

exports.generateToken = (payload, passwordReset = false) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = passwordReset
        ? process.env.PASSWORD_RESET_TOKEN_EXPIRATION || DEFAULT_PASSWORD_RESET_EXPIRATION
        : process.env.LOGIN_TOKEN_EXPIRATION || DEFAULT_LOGIN_EXPIRATION;

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
