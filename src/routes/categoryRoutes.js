const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { idParamSchema } = require("../validations/common.validation");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category.validation");
const {
  createCategory,
  getCategories,
  getProductsCountByCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router
  .route("/")
  .post(validate(createCategorySchema), createCategory)
  .get(getCategories);

router.get("/products-count", getProductsCountByCategory);

router
  .route("/:id")
  .get(validate(idParamSchema, "params"), getCategoryById)
  .put(validate(idParamSchema, "params"), validate(updateCategorySchema), updateCategory)
  .delete(validate(idParamSchema, "params"), deleteCategory);

module.exports = router;
