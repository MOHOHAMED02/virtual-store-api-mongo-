const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Mongoose validation failed",
      errors: details,
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}': ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field '${field}' - it already exists`,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { detail: err.message } : {}),
  });
};

module.exports = errorHandler;
