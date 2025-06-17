
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
  const { id } = req.user;

  if (!id) {
    throw new ErrorHandller("UserId is required", 400);
  }

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new ErrorHandller("User not found", 404);
    }
    if (!user.isLoggedIn) {
      throw new ErrorHandller("Unathorized", 401)
    }
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.otp;

    return res.status(200).json({ message: 'Success', data: userObj })
  } catch (error) {
    next(error)
  }


}

export const getAllUsersController = async (req, res, next) => {

  try {
    const { role } = req.user;
    if (role !== "admin") {
      throw new ErrorHandller("Access denied: Admins only", 403);
    }
    const users = await User.find().select("-password -otp -refreshToken");
    return res.status(200).json({ message: 'Success', data: users })
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
    const { username, email, password,role } = req.body;
    const userExist = await findUser({ email, username });

    if (userExist) {
      throw new ErrorHandller("A user with this email or username already exists.", 409);
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp()
    const savedData = await createUser(username, email, hashedPassword, otp,role);
    const verificationLink = `${process.env.VERIFICATION_URL}?userid=${savedData._id}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: savedData?.email,
      subject: 'Welcome to Altimate Authentication',
      text: `Your account has been created with email :${savedData?.email}`,
      html: `<b>Please verify the email using the OTP ${otp} by clicking this</b> <a href=${verificationLink}>link</a>`
    }

    await transporter.sendMail(mailOptions)
    return res.status(201).json({
      error: false,
      data: { id: savedData._id, username: savedData.username, email: savedData.email }
    });
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

    const { token, refreshToken } = generateToken(user, process.env.LOGIN_SECRET,);
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 60 * 1000,
    };

    user.isLoggedIn = true;
    await user.save();


    res.cookie("token", token, cookieOptions);
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 5 * 60 * 1000 });

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
    const decoded = jwt.verify(refreshToken, process.env.LOGIN_SECRET);

    const user = await User.findUser({ id: decoded.id });

    if (!user) {
      throw new ErrorHandller("User not found", 404);
    }
    const { token: newAccessToken } = generateToken(user, process.env.LOGIN_SECRET);
    res.clearCookie("token");
    const cookieOptions = { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 };
    res.cookie("token", newAccessToken, cookieOptions);

    return res.status(200).json({ error: false, message: "Access token refreshed", token: newAccessToken });
  } catch (error) {
    next(error);
  }
}

export const verifyEmailController = async (req, res, next) => {
  const errors = checkFieldsError(req);
  if (errors) {
    return res.status(400).json({ errors });
  }
  const { otp, userId } = req.body;
  try {
    const user = await findUser({ id: userId });
    if (!user) {
      throw new ErrorHandller("User not found with this id!", 404)
    }
    if (!user.isLoggedIn) {
      throw new ErrorHandller("Unathorized", 401)
    }
    if (user.otp !== otp) {
      throw new ErrorHandller("Entered Invalid OTP!", 400)
    }
    if (user.email_verified) {
      throw new ErrorHandller("Email Already Verified", 403)
    }
    await User.findByIdAndUpdate(userId, { email_verified: true });
    return res.status(200).json({ error: false, message: "Email verified successfully" })
  } catch (error) {
    next(error)
  }
}

export const forgetPasswordController = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new ErrorHandller("Email is required", 400)
    }
    const user = await findUser({ email })
    if (!user) {
      throw new ErrorHandller("No user found with this email", 404)
    }
    if (!user.isLoggedIn) {
      throw new ErrorHandller("Unathorized", 401)
    }
    const { token } = generateToken(user, process.env.PASS_SECRET);
    const verificationLink = `${process.env.FORGET_PASS_URL}?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user?.email,
      subject: 'Forget Password',
      text: `Bellow link is valid for 1 hour only`,
      html: `<b>Go for new password by clicking this</b> <a href=${verificationLink}>forget password link</a>`
    }

    await transporter.sendMail(mailOptions)
    return res.status(200).json({ error: false, message: 'Please checck your email and go for new password' });
  } catch (error) {
    next(error)
  }
}

export const resetPasswordController = async (req, res, next) => {
  const { password, token } = req.body;

  try {
    if (!password) {
      throw new ErrorHandller("Password is required!", 400);
    }

    if (!token) {
      throw new ErrorHandller("Token is required", 400);
    }

    const decoded = jwt.verify(token, process.env.PASS_SECRET);

    const user = await findUser({ id: decoded.id });
    if (!user) {
      throw new ErrorHandller("No user found with this token", 404);
    }
    if (!user.isLoggedIn) {
      throw new ErrorHandller("Unathorized", 401)
    }

    const hashedPassword = await hashPassword(password);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).json({ error: false, message: "Password changed successfully" });

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandller("Reset token has expired", 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandller("Invalid reset token", 401));
    }
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await findUser({ id });
    if (!user) {
      throw new ErrorHandller("No user found with this id", 404)
    }
    if (!user.isLoggedIn) {
      throw new ErrorHandller("Unathorized", 401)
    }
    user.isLoggedIn = false;
    await user.save();
    res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'Lax' })
    res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'Lax' })
    return res.status(200).json({ error: false, message: "Logged out successfully" });
  } catch (error) {
    next(error)
  }
}
