import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    // match: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    //required: true,
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    max: 6,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
   phone_verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});

const User = mongoose.model("User", userSchema);

export default User