const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "category name must contain at least 2 characters")
    .max(50, "category name is too long"),
  description: z.string().trim().max(300).optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "at least one field must be provided" }
);

module.exports = { createCategorySchema, updateCategorySchema };
