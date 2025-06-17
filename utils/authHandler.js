import jwt from "jsonwebtoken";

export const generateToken = (user, secretKey) => {
    const token = jwt.sign({ email: user?.email, id: user._id, role: user.role }, secretKey, { expiresIn: 60 * 60 });
    const refreshToken = jwt.sign({ email: user?.email, id: user._id, role: user.role }, secretKey, { expiresIn: "7d" });
    return { token, refreshToken }
};
