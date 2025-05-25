import express from "express";
import authRoutes from "./routes/index.js";
import connectDb from "./db.js";

const app = express();
const port = 5500;

app.use(express.json());
app.use('/api/auth',authRoutes);

app.listen(port, () => {
  connectDb();
  console.log("App listening on Port : ", port);
});
