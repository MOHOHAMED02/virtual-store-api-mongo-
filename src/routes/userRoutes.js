const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { idParamSchema } = require("../validations/common.validation");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validations/user.validation");
const {
  createUser,
  getUsers,
  getUserById,
  getUserOrders,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router
  .route("/")
  .post(validate(createUserSchema), createUser)
  .get(getUsers);

router.get("/:id/orders", validate(idParamSchema, "params"), getUserOrders);

router
  .route("/:id")
  .get(validate(idParamSchema, "params"), getUserById)
  .put(validate(idParamSchema, "params"), validate(updateUserSchema), updateUser)
  .delete(validate(idParamSchema, "params"), deleteUser);

module.exports = router;
