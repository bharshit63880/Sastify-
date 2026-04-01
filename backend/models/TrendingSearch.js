const mongoose = require("mongoose");
const { Schema } = mongoose;

const trendingSearchSchema = new Schema(
    {
        query: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        count: {
            type: Number,
            default: 1,
        },
        lastSearchedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("TrendingSearch", trendingSearchSchema);
