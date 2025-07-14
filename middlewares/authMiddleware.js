import { findUser } from "../services/authServices.js";
import { generateToken } from "../utils/authHandler.js";
import { ErrorHandller } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const authenticatedRoutes = async (req, res, next) => {

  try {
    // let token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
    let token = req.cookies?.token;
    if (!token && req.cookies?.refreshToken) {
      const refreshDecoded = jwt.verify(req.cookies.refreshToken, process.env.LOGIN_SECRET);
      const user = await findUser({ id: refreshDecoded.id });
      if (!user) throw new ErrorHandller("User not found during token refresh", 404);
      const tokens = generateToken(user, process.env.LOGIN_SECRET);
      token = tokens.token;

      res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 });

      req.user = jwt.verify(token, process.env.LOGIN_SECRET);
      return next();
    }

    if (!token) {
      throw new ErrorHandller("Token is invalid", 401)
    }

    const decoded = jwt.verify(token, process.env.LOGIN_SECRET)

    req.user = decoded;
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandller("Reset token has expired", 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandller("Invalid token", 401));
    }
    next(error);
  }
}


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole || !roles.includes(userRole)) {
        throw new ErrorHandller("Access denied", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
