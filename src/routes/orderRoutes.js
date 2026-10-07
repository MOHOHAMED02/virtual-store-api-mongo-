const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const {
  idParamSchema,
  userIdParamSchema,
} = require("../validations/common.validation");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validations/order.validation");
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

router
  .route("/")
  .post(validate(createOrderSchema), createOrder)
  .get(getOrders);

router.get(
  "/user/:userId",
  validate(userIdParamSchema, "params"),
  getOrdersByUser
);

router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

router
  .route("/:id")
  .get(validate(idParamSchema, "params"), getOrderById)
  .delete(validate(idParamSchema, "params"), deleteOrder);

module.exports = router;
