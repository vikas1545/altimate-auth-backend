import { ErrorHandller } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const authenticatedRoutes = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
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
            return next(new ErrorHandller("Invalid reset token", 401));
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
