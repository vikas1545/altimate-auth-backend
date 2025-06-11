
import User from "../models/userModel.js";
import { createUser, findUser } from "../services/authServices.js";
import { generateToken } from "../utils/authHandler.js";
import checkFieldsError from "../utils/checkFieldsError.js";
import { ErrorHandller } from "../utils/errorHandler.js";
import generateOtp from "../utils/generateOtp.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { transporter } from "../utils/mailHandler.js";
import jwt from "jsonwebtoken";

export const getUserByIdController = async (req, res, next) => {
  const userId = req.params['userId'];

  if (!userId) {
    throw new ErrorHandller("UserId is required", 400);
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new ErrorHandller("User not found", 404);
    }

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.otp;

    res.status(200).json({ message: 'Success', data: userObj })

    next()
  } catch (error) {
    next(error)
  }


}

export const registerController = async (req, res, next) => {
  try {
    const errors = checkFieldsError(req);
    if (errors) {
      return res.status(400).json({ errors });
    }
    const { username, email, password } = req.body;
    const userExist = await findUser({ email, username });

    if (userExist) {
      throw new ErrorHandller("A user with this email or username already exists.", 409);
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp()
    const savedData = await createUser(username, email, hashedPassword, otp);
    const verificationLink = `${process.env.VERIFICATION_URL}?userid=${savedData._id}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: savedData?.email,
      subject: 'Welcome to Altimate Authentication',
      text: `Your account has been created with email :${savedData?.email}`,
      html: `<b>Please verify the email using the OTP ${otp} by clicking this</b> <a href=${verificationLink}>link</a>`
    }

    await transporter.sendMail(mailOptions)
    return res.status(201).json({ error: false, data: { id: savedData._id, username: savedData.username, email: savedData.email } });
  } catch (error) {
    next(error)
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await findUser({ email, username });

    if (!user) {
      throw new ErrorHandller("No user found with this email or username", 404)
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword) {
      throw new ErrorHandller("Wrong username or password !", 401)
    }

    const { token, refreshToken } = generateToken(user);
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000,
    };
    res.cookie("Token", token, cookieOptions);
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ error: false, message: "Success", token, refreshToken });
  } catch (error) {
    next(error)
  }
};

export const refreshTokenController = async (req, res, next) => {
  const refreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ErrorHandller("Refresh token is not found", 401)
  }

  try {
    const decoded = jwt.verify(refreshToken, "LOGIN_SECRET");

    const user = await User.findUser({ id: decoded.id });

    if (!user) {
      throw new ErrorHandller("User not found", 404);
    }
    const { token: newAccessToken } = generateToken(user);
    res.clearCookie("Token");
    const cookieOptions = { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 };
    res.cookie("Token", newAccessToken, cookieOptions);

    return res.status(200).json({ error: false, message: "Access token refreshed", token: newAccessToken });
  } catch (error) {
    next(error);
  }
}
