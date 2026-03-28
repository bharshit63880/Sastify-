const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullName: {
            type: String,
            default: "",
        },
        line1: {
            type: String,
            default: "",
        },
        line2: {
            type: String,
            default: "",
        },
        street: {
            type: String,
            default: "",
        },
        landmark: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: "home",
        },
        addressType: {
            type: String,
            enum: ["home", "office", "other"],
            default: "home",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, versionKey: false }
);

addressSchema.pre("validate", function syncFields(next) {
    if (!this.line1 && this.street) {
        this.line1 = this.street;
    }

    if (!this.street && this.line1) {
        this.street = this.line1;
    }

    if (!this.addressType && this.type) {
        this.addressType = ["home", "office", "other"].includes(this.type.toLowerCase())
            ? this.type.toLowerCase()
            : "home";
    }

    if (!this.type && this.addressType) {
        this.type = this.addressType;
    }

    next();
});

module.exports = mongoose.model("Address", addressSchema);
