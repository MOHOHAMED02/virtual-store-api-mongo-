const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "category name must contain at least 2 characters"],
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Category", categorySchema);
