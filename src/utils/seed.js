require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
    ]);

    const categories = await Category.insertMany([
      { name: "Laptops", description: "Laptops and accessories" },
      { name: "Phones", description: "Smartphones and accessories" },
      { name: "Books", description: "Printed and digital books" },
    ]);

    const [laptops, phones, books] = categories;

    await Product.insertMany([
      {
        name: "Dell XPS 13",
        description: "13 inch ultrabook",
        price: 4500,
        stock: 10,
        category: laptops._id,
        tags: ["laptop", "dell", "ultrabook"],
      },
      {
        name: "MacBook Air M2",
        description: "Apple laptop",
        price: 5200,
        stock: 5,
        category: laptops._id,
        tags: ["laptop", "apple"],
      },
      {
        name: "iPhone 15",
        price: 4200,
        stock: 8,
        category: phones._id,
        tags: ["phone", "apple"],
      },
      {
        name: "Clean Code",
        description: "Robert C. Martin",
        price: 160,
        stock: 25,
        category: books._id,
        tags: ["book", "programming"],
      },
    ]);

    await User.create({
      fullName: "Test User",
      email: "test@example.com",
      password: "123456",
      phone: "050-1234567",
      addresses: [{ city: "Haifa", street: "Herzl", houseNumber: 12 }],
    });

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
