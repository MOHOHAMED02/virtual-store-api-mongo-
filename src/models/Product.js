const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
      trim: true,
      minlength: [2, "product name must contain at least 2 characters"],
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "stock is required"],
      min: [0, "stock cannot be negative"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model("Product", productSchema);
