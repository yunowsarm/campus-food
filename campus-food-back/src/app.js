require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const userRoutes = require("./routes/users");
const merchantRoutes = require("./routes/merchants");
const categoryRoutes = require("./routes/categories");
const foodRoutes = require("./routes/foods");
const orderRoutes = require("./routes/orders");
const groupRoutes = require("./routes/groups");
const deliveryRoutes = require("./routes/deliveries");
const addressRoutes = require("./routes/addresses");
const campusAddressRoutes = require("./routes/campusAddresses");
const favoriteRoutes = require("./routes/favorites");
const messageRoutes = require("./routes/messages");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "..", "uploadFiles");
app.use("/uploadFiles", express.static(uploadDir));

app.get("/health", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/campus-addresses", campusAddressRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
