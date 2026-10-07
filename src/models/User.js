const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    houseNumber: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
      minlength: [2, "fullName must contain at least 2 characters"],
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "email format is invalid"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password must contain at least 6 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9-+\s()]{7,15}$/, "phone format is invalid"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
