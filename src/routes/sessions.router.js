import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt.utils.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  (req, res) => {
    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      payload: {
        id: req.user._id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        role: req.user.role,
      },
    });
  },
);

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user);

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        status: "success",
        message: "Login exitoso",
        token,
        user: {
          id: req.user._id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role,
          cart: req.user.cart,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
);

router.get("/current", authMiddleware, (req, res) => {
  res.json({
    status: "success",
    payload: {
      id: req.user._id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      role: req.user.role,
      cart: req.user.cart,
    },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    status: "success",
    message: "Logout exitoso",
  });
});

export default router;
