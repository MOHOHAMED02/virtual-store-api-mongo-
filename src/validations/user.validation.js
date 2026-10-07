const { z } = require("zod");

const addressSchema = z.object({
  city: z.string().trim().min(2, "city must contain at least 2 characters"),
  street: z.string().trim().min(2, "street must contain at least 2 characters"),
  houseNumber: z.number().int().positive("houseNumber must be a positive number"),
});

const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "fullName must contain at least 2 characters")
    .max(60, "fullName is too long"),
  email: z.string().trim().toLowerCase().email("email format is invalid"),
  password: z.string().min(6, "password must contain at least 6 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9-+\s()]{7,15}$/, "phone format is invalid")
    .optional(),
  role: z.enum(["customer", "admin"]).optional(),
  addresses: z.array(addressSchema).optional(),
});

const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "at least one field must be provided" }
);

module.exports = { createUserSchema, updateUserSchema };
