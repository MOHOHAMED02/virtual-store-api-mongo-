const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || source,
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed (Zod)",
      errors,
    });
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
