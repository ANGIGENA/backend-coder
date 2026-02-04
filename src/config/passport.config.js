import passport from "passport";
import local from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../models/user.model.js";
import { CartModel } from "../models/cart.model.js";
import { createHash, isValidPassword } from "../utils/bcrypt.utils.js";

const LocalStrategy = local.Strategy;
const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto_jwt_2024";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

export const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;

          const existingUser = await UserModel.findOne({ email });
          if (existingUser) {
            return done(null, false, { message: "El usuario ya existe" });
          }

          const newCart = await CartModel.create({ products: [] });

          const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: newCart._id,
            role: email === "admin@admin.com" ? "admin" : "user",
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email }).populate("cart");
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }

          if (!isValidPassword(password, user.password)) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await UserModel.findById(jwt_payload.id).populate(
            "cart",
          );
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
