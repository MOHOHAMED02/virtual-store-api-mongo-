const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw new ApiError(404, "Category not found - cannot create the product");

  const product = await Product.create(req.body);
  await product.populate("category", "name description");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, inStock } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (inStock === "true") filter.stock = { $gt: 0 };

  if (search) {
    const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: safeSearch, $options: "i" };
  }

  const toNumber = (value, field) => {
    const num = Number(value);
    if (Number.isNaN(num)) throw new ApiError(400, `${field} must be a number`);
    return num;
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = toNumber(minPrice, "minPrice");
    if (maxPrice !== undefined) filter.price.$lte = toNumber(maxPrice, "maxPrice");
  }

  const products = await Product.find(filter)
    .populate("category", "name description")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) throw new ApiError(404, "Category not found");

  const products = await Product.find({ category: category._id }).populate(
    "category",
    "name"
  );

  res.status(200).json({
    success: true,
    category: { _id: category._id, name: category.name },
    count: products.length,
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name description"
  );
  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) throw new ApiError(404, "Category not found");
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name description");

  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const ordersCount = await Order.countDocuments({ "items.product": req.params.id });
  if (ordersCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete a product that appears in ${ordersCount} existing order(s)`
    );
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: product,
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
};
