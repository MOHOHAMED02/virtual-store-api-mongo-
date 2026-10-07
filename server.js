/**
 * ==========================================================
 *  מטלת סיום – MongoDB | שרת לניהול חנות וירטואלית
 *  שם מלא: מוחמד שיבלי
 *  ת"ז:    213025042
 * ==========================================================
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const notFound = require("./src/middlewares/notFound");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Virtual Store API is running",
    endpoints: {
      users: "/api/users",
      categories: "/api/categories",
      products: "/api/products",
      orders: "/api/orders",
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
