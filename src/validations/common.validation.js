const { z } = require("zod");

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "must be a valid MongoDB ObjectId");

const idParamSchema = z.object({
  id: objectId,
});

const categoryIdParamSchema = z.object({
  categoryId: objectId,
});

const userIdParamSchema = z.object({
  userId: objectId,
});

module.exports = {
  objectId,
  idParamSchema,
  categoryIdParamSchema,
  userIdParamSchema,
};
