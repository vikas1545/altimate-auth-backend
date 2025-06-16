import { ErrorHandller } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

const authenticatedRoutes = async (req, res, next) => {
    try {
        const token = req.cookie?.token || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new ErrorHandller("Token is invalid", 401)
        }
        const { err, decoded } = jwt.verify(token, process.env.LOGIN_SECRET, (err, decoded) => {
            return { err, decoded }
        });

        if (err) {
            throw new ErrorHandller("Token is invalid or Expired!", 401)
        }

        req.user = decoded;
        next()
    } catch (error) {
        next(error)
    }
}

export default authenticatedRoutes;