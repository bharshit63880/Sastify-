const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/OTP");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendMail } = require("../utils/Emails");
const { generateOTP } = require("../utils/GenerateOtp");
const { generateToken } = require("../utils/GenerateToken");
const { sanitizeUser } = require("../utils/SanitizeUser");

const cookieOptions = {
    sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
    maxAge: parseInt(process.env.COOKIE_EXPIRATION_DAYS || "7", 10) * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.PRODUCTION === "true",
};

exports.signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email?.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const createdUser = await User.create({
            ...req.body,
            email: req.body.email?.toLowerCase(),
            password: hashedPassword,
            role: "user",
        });

        const secureInfo = sanitizeUser(createdUser);
        const token = generateToken(secureInfo);

        res.cookie("token", token, cookieOptions);
        res.status(201).json(secureInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred during signup, please try again later" });
    }
};

exports.login = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email?.toLowerCase() });

        if (!existingUser || !(await bcrypt.compare(req.body.password, existingUser.password))) {
            res.clearCookie("token", cookieOptions);
            return res.status(404).json({ message: "Invalid credentials" });
        }

        if (existingUser.isBlocked) {
            return res.status(403).json({ message: "Your account has been blocked" });
        }

        const secureInfo = sanitizeUser(existingUser);
        const token = generateToken(secureInfo);

        res.cookie("token", token, cookieOptions);
        return res.status(200).json(secureInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some error occurred while logging in, please try again later" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const isValidUserId = await User.findById(req.body.userId);

        if (!isValidUserId) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOtpExisting = await Otp.findOne({ user: isValidUserId._id });

        if (!isOtpExisting) {
            return res.status(404).json({ message: "Otp not found" });
        }

        if (isOtpExisting.expiresAt < new Date()) {
            await Otp.findByIdAndDelete(isOtpExisting._id);
            return res.status(400).json({ message: "Otp has expired" });
        }

        if (await bcrypt.compare(req.body.otp, isOtpExisting.otp)) {
            await Otp.findByIdAndDelete(isOtpExisting._id);
            const verifiedUser = await User.findByIdAndUpdate(
                isValidUserId._id,
                { isVerified: true },
                { new: true }
            );
            return res.status(200).json(sanitizeUser(verifiedUser));
        }

        return res.status(400).json({ message: "Otp is invalid or expired" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some error occurred" });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const existingUser = await User.findById(req.body.user);

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        await Otp.deleteMany({ user: existingUser._id });

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpirationTime = parseInt(process.env.OTP_EXPIRATION_TIME || "300000", 10);

        await Otp.create({
            user: req.body.user,
            otp: hashedOtp,
            expiresAt: Date.now() + otpExpirationTime,
        });

        await sendMail(
            existingUser.email,
            "OTP Verification for your Sastify account",
            `Your one-time password is ${otp}. Do not share this OTP with anyone.`
        );

        res.status(201).json({ message: "OTP sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some error occurred while resending otp, please try again later" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "Provided email does not exist" });
        }

        await PasswordResetToken.deleteMany({ user: user._id });

        const passwordResetToken = generateToken(sanitizeUser(user), true);
        const hashedToken = await bcrypt.hash(passwordResetToken, 10);
        const expirationTime = parseInt(process.env.OTP_EXPIRATION_TIME || "300000", 10);

        await PasswordResetToken.create({
            user: user._id,
            token: hashedToken,
            expiresAt: Date.now() + expirationTime,
        });

        await sendMail(
            user.email,
            "Password reset link for Sastify",
            `${process.env.ORIGIN}/reset-password/${user._id}/${passwordResetToken}`
        );

        res.status(200).json({ message: `Password reset link sent to ${user.email}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while sending password reset mail" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const resetToken = await PasswordResetToken.findOne({ user: user._id });

        if (!resetToken) {
            return res.status(404).json({ message: "Reset link is not valid" });
        }

        if (resetToken.expiresAt < new Date()) {
            await PasswordResetToken.findByIdAndDelete(resetToken._id);
            return res.status(404).json({ message: "Reset link has expired" });
        }

        if (!(await bcrypt.compare(req.body.token, resetToken.token))) {
            return res.status(404).json({ message: "Reset link has expired" });
        }

        await PasswordResetToken.findByIdAndDelete(resetToken._id);
        await User.findByIdAndUpdate(user._id, {
            password: await bcrypt.hash(req.body.password, 10),
        });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred while resetting the password, please try again later" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Logout failed" });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const user = await User.findById(req.user._id);
        return res.status(200).json(sanitizeUser(user));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};
