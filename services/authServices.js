import User from "../models/userModel.js";

export const findUserByEmailOrUsername = async (email, username) => {
  return await User.findOne({
    $or: [{ email: email }, { username: username }],
  });
};

export const createUser = async (username, email, hashedPassword) => {
  const user = new User();
  user.username = username;
  user.email = email;
  user.password = hashedPassword;
  return await user.save();
};
