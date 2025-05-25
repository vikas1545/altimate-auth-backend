import User from "../models/userModel.js";

export const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExist = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    
    if (userExist) {
      return res.status(401).json({
        error: true,
        message: "With this email or username an User already existing",
      });
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    const savedData = await user.save();
    res.status(201).json({
      error: false,
      data: savedData,
    });
  } catch (error) {
    console.log("error while saving data :", error);
  }
};
