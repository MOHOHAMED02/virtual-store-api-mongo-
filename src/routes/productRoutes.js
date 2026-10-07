const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const {
  idParamSchema,
  categoryIdParamSchema,
} = require("../validations/common.validation");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validations/product.validation");
const {
  createProduct,
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router
  .route("/")
  .post(validate(createProductSchema), createProduct)
  .get(getProducts);

router.get(
  "/category/:categoryId",
  validate(categoryIdParamSchema, "params"),
  getProductsByCategory
);

router
  .route("/:id")
  .get(validate(idParamSchema, "params"), getProductById)
  .put(validate(idParamSchema, "params"), validate(updateProductSchema), updateProduct)
  .delete(validate(idParamSchema, "params"), deleteProduct);

module.exports = router;
