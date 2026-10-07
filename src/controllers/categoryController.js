const Category = require("../models/Category");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const createCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findOne({ name: req.body.name });
  if (existing) throw new ApiError(409, "A category with this name already exists");

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

const getProductsCountByCategory = asyncHandler(async (req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().lean(),
    Product.aggregate([
      { $group: { _id: "$category", productsCount: { $sum: 1 } } },
    ]),
  ]);

  const countsByCategory = new Map(counts.map((c) => [String(c._id), c]));

  const stats = categories
    .map((category) => {
      const entry = countsByCategory.get(String(category._id));
      return {
        _id: category._id,
        name: category.name,
        description: category.description,
        productsCount: entry ? entry.productsCount : 0,
      };
    })
    .sort((a, b) => b.productsCount - a.productsCount || a.name.localeCompare(b.name));

  res.status(200).json({
    success: true,
    count: stats.length,
    data: stats,
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const productsCount = await Product.countDocuments({ category: category._id });

  res.status(200).json({
    success: true,
    data: { ...category.toObject(), productsCount },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete a category that contains ${productsCount} product(s)`
    );
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
});

module.exports = {
  createCategory,
  getCategories,
  getProductsCountByCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
