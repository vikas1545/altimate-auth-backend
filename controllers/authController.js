import {
  createUser,
  findUserByEmailOrUsername,
} from "../services/authServices.js";
import { generateToken } from "../utils/authHandler.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";

export const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExist = await findUserByEmailOrUsername(email, username);

    if (userExist) {
      return res.status(401).json({
        error: true,
        message: "With this email or username an User already existing",
      });
    }

    const hashedPassword = await hashPassword(password);

    const savedData = await createUser(username, email, hashedPassword);
    return res.status(201).json({
      error: false,
      data: savedData,
    });
  } catch (error) {
    console.log("error while saving data :", error);
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    //by passing u
    const user = await findUserByEmailOrUsername(email, username);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "No user found with this email or username",
      });
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword) {
      return res
        .status(401)
        .json({ error: true, message: "Wrong username or password !" });
    }

    const {token,refreshToken}=generateToken(user);

    res.cookie("Token", token, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res
      .status(200)
      .json({ error: false, message: "Success", token, refreshToken });
  } catch (error) {
    console.log("error while login :", error);
  }
};
