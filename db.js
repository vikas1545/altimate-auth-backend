import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.dbUrl);
    console.log("connect to db *****");
  } catch (error) {
    console.log("Faild to connect to db ***** ", error);
  }
};

export default connectDb;
