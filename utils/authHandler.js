import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    const token = jwt.sign({ email: user?.email, id: user._id }, "LOGIN_SECRET", { expiresIn: 60 * 60 });
    const refreshToken = jwt.sign({ email: user?.email, id: user._id }, "LOGIN_SECRET", { expiresIn: "7d" });
    return {token,refreshToken}
};
