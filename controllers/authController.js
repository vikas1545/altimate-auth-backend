import {
  createUser,
  findUserByEmailOrUsername,
} from "../services/authServices.js";
import { generateToken } from "../utils/authHandler.js";
import { ErrorHandller } from "../utils/errorHandler.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";

export const registerController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const userExist = await findUserByEmailOrUsername(email, username);

    if (userExist) {
      throw new ErrorHandller("With this email or username an User already existing", 401)
    }

    const hashedPassword = await hashPassword(password);

    const savedData = await createUser(username, email, hashedPassword);
    return res.status(201).json({ error: false, data: savedData });
  } catch (error) {
    next(error)
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    //by passing u
    const user = await findUserByEmailOrUsername(email, username);

    if (!user) {
      throw new ErrorHandller("No user found with this email or username", 404)
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword) {
      throw new ErrorHandller("Wrong username or password !", 401)
    }

    const { token, refreshToken } = generateToken(user);

    res.cookie("Token", token, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res.status(200).json({ error: false, message: "Success", token, refreshToken });
  } catch (error) {
    next(error)
  }
};
