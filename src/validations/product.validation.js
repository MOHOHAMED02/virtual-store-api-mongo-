const { z } = require("zod");
const { objectId } = require("./common.validation");

const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "product name must contain at least 2 characters")
    .max(100, "product name is too long"),
  description: z.string().trim().max(1000).optional(),
  price: z.number().nonnegative("price cannot be negative"),
  stock: z.number().int("stock must be an integer").nonnegative("stock cannot be negative"),
  category: objectId,
  tags: z.array(z.string().trim().min(1)).optional(),
  images: z.array(z.string().trim().url("image must be a valid URL")).optional(),
  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "at least one field must be provided" }
);

module.exports = { createProductSchema, updateProductSchema };
