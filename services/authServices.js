import User from "../models/userModel.js";



export const findUser = async ({ id, email, username }) => {
  const orConditions = [
    id && { _id: id },
    email && { email },
    username && { username }
  ].filter(Boolean);

  if (orConditions.length === 0) return null;
  return await User.findOne({ $or: orConditions });
};

export const createUser = async (username, email, hashedPassword, otp) => {
  const user = new User();
  user.username = username;
  user.email = email;
  user.password = hashedPassword;
  user.otp = otp;
  return await user.save();
};
