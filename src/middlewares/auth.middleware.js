import passport from "passport";

export const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error en la autenticación",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado. Token inválido o expirado",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Acceso denegado. Solo administradores",
    });
  }

  next();
};

export const userOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado",
    });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({
      status: "error",
      message: "Acceso denegado. Solo usuarios",
    });
  }

  next();
};
