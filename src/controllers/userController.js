const User = require("../models/User");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({ success: true, data: user });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const orders = await Order.find({ user: req.params.id })
    .populate("user", "fullName email phone")
    .populate({
      path: "items.product",
      select: "name price category",
      populate: { path: "category", select: "name" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    user: { _id: user._id, fullName: user.fullName, email: user.email },
    count: orders.length,
    data: orders,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const ordersCount = await Order.countDocuments({ user: req.params.id });
  if (ordersCount > 0) {
    throw new ApiError(400, "Cannot delete a user that has existing orders");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: user,
  });
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserOrders,
  updateUser,
  deleteUser,
};
