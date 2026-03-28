const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: "",
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

userSchema.pre("validate", function syncRole(next) {
    if (!this.role) {
        this.role = this.isAdmin ? "admin" : "user";
    }

    this.isAdmin = this.role === "admin";
    next();
});

module.exports = mongoose.model("User", userSchema);
