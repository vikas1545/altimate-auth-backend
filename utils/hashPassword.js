import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePassword = async (password, hashePassword) => {
  return await bcrypt.compare(password, hashePassword);
};

export { hashPassword, comparePassword };
