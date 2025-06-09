import { validationResult } from "express-validator";
import {
  createUser,
  findUserByEmailOrUsername,
} from "../services/authServices.js";
import { generateToken } from "../utils/authHandler.js";
import { ErrorHandller } from "../utils/errorHandler.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { transporter } from "../utils/mailHandler.js";

export const registerController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { username, email, password } = req.body;
    const userExist = await findUserByEmailOrUsername(email, username);

    if (userExist) {
      throw new ErrorHandller("With this email or username an User already existing", 401)
    }

    const hashedPassword = await hashPassword(password);
    const verificationOTP = Math.floor(Math.random(6) * 900000);
    const savedData = await createUser(username, email, hashedPassword, verificationOTP);
    const verificationLink = `http://localhost:5173/verify-otp?userid=${savedData._id}`;
    //const verificationOTP = 123456;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: savedData?.email,
      subject: 'Welcome to Altimate Authentication',
      text: `Your account has been created with email :${savedData?.email}`,
      html: `<b>Please verify the email using the OTP ${verificationOTP} by clicking this</b> <a href=${verificationLink}>link</a>`
    }

    await transporter.sendMail(mailOptions)
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
