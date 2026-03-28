require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/Auth");
const productRoutes = require("./routes/Product");
const orderRoutes = require("./routes/Order");
const cartRoutes = require("./routes/Cart");
const brandRoutes = require("./routes/Brand");
const categoryRoutes = require("./routes/Category");
const userRoutes = require("./routes/User");
const addressRoutes = require("./routes/Address");
const reviewRoutes = require("./routes/Review");
const wishlistRoutes = require("./routes/Wishlist");
const paymentRoutes = require("./routes/payment");
const couponRoutes = require("./routes/Coupon");
const adminRoutes = require("./routes/Admin");
const storefrontRoutes = require("./routes/Storefront");
const { connectToDB } = require("./database/db");

const server = express();

connectToDB();

const allowedOrigins = (process.env.ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

server.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        exposedHeaders: ["X-Total-Count"],
        methods: ["GET", "POST", "PATCH", "DELETE"],
    })
);
server.use(express.json({ limit: "2mb" }));
server.use(cookieParser());
server.use(morgan("tiny"));
server.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (error) {
        next(error);
    }
});

server.use("/auth", authRoutes);
server.use("/users", userRoutes);
server.use("/products", productRoutes);
server.use("/orders", orderRoutes);
server.use("/cart", cartRoutes);
server.use("/brands", brandRoutes);
server.use("/categories", categoryRoutes);
server.use("/address", addressRoutes);
server.use("/reviews", reviewRoutes);
server.use("/wishlist", wishlistRoutes);
server.use("/payments", paymentRoutes);
server.use("/coupons", couponRoutes);
server.use("/admin", adminRoutes);
server.use("/storefront", storefrontRoutes);

server.get("/", (req, res) => {
    res.status(200).json({ message: "running" });
});

server.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== "production") {
    server.listen(PORT, () => {
        console.log(`server [STARTED] ~ http://localhost:${PORT}`);
    });
}

module.exports = server;
