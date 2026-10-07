const { z } = require("zod");
const { objectId } = require("./common.validation");

const orderItemSchema = z.object({
  product: objectId,
  quantity: z
    .number()
    .int("quantity must be an integer")
    .positive("quantity must be at least 1"),
});

const createOrderSchema = z.object({
  user: objectId,
  items: z
    .array(orderItemSchema)
    .min(1, "order must contain at least one item"),
  shippingAddress: z
    .object({
      city: z.string().trim().min(2),
      street: z.string().trim().min(2),
      houseNumber: z.number().int().positive(),
    })
    .optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"], {
    errorMap: () => ({ message: "status must be one of: pending, paid, shipped, delivered, cancelled" }),
  }),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
