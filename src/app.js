import express from "express";
import { create } from "express-handlebars";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";

import { connectDB } from "./config/database.js";
import { initializePassport } from "./config/passport.config.js";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import { ProductModel } from "./models/product.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

initializePassport();

const hbs = create({
  extname: ".handlebars",
  defaultLayout: "main",
  layoutsDir: __dirname + "/views/layouts",
  helpers: {
    multiply: (a, b) => a * b,
    eq: (a, b) => a === b,
    or: (a, b) => a || b,
  },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(passport.initialize());

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

app.get("/api", (req, res) => {
  res.json({
    message: "Bienvenido a la API de E-commerce",
    endpoints: {
      products: "/api/products",
      carts: "/api/carts",
      sessions: {
        register: "POST /api/sessions/register",
        login: "POST /api/sessions/login",
        current: "GET /api/sessions/current",
        logout: "POST /api/sessions/logout",
      },
      views: {
        products: "/products",
        productDetail: "/products/:pid",
        cart: "/carts/:cid",
        realTimeProducts: "/realtimeproducts",
        login: "/login",
        register: "/register",
      },
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

const httpServer = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Endpoints disponibles:`);
  console.log(`\n  🔐 Autenticación:`);
  console.log(`    - POST   /api/sessions/register`);
  console.log(`    - POST   /api/sessions/login`);
  console.log(`    - GET    /api/sessions/current`);
  console.log(`    - POST   /api/sessions/logout`);
  console.log(`\n  📦 Productos:`);
  console.log(`    - GET    /api/products`);
  console.log(`    - GET    /api/products/:pid`);
  console.log(`    - POST   /api/products`);
  console.log(`    - PUT    /api/products/:pid`);
  console.log(`    - DELETE /api/products/:pid`);
  console.log(`\n  🛒 Carritos:`);
  console.log(`    - POST   /api/carts`);
  console.log(`    - GET    /api/carts/:cid`);
  console.log(`    - POST   /api/carts/:cid/product/:pid`);
  console.log(`    - DELETE /api/carts/:cid/products/:pid`);
  console.log(`    - PUT    /api/carts/:cid`);
  console.log(`    - PUT    /api/carts/:cid/products/:pid`);
  console.log(`    - DELETE /api/carts/:cid`);
  console.log(`\n  🌐 Vistas:`);
  console.log(`    - GET    /products`);
  console.log(`    - GET    /products/:pid`);
  console.log(`    - GET    /carts/:cid`);
  console.log(`    - GET    /realtimeproducts`);
  console.log(`    - GET    /login`);
  console.log(`    - GET    /register`);
});

const io = new Server(httpServer);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ Nuevo cliente conectado:", socket.id);

  ProductModel.find()
    .lean()
    .then((products) => {
      socket.emit("updateProducts", products);
    });

  socket.on("addProduct", async (productData) => {
    try {
      const newProduct = await ProductModel.create(productData);
      const products = await ProductModel.find().lean();
      io.emit("updateProducts", products);

      socket.emit("productAdded", {
        success: true,
        message: "Producto agregado exitosamente",
        product: newProduct,
      });
    } catch (error) {
      socket.emit("productError", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await ProductModel.findByIdAndDelete(productId);
      const products = await ProductModel.find().lean();
      io.emit("updateProducts", products);

      socket.emit("productDeleted", {
        success: true,
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      socket.emit("productError", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

export default app;
