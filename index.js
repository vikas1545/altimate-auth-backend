import express from "express";
import authRoutes from "./routes/index.js";
import connectDb from "./db.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();
const port = 5500;

app.use(express.json());
app.use('/api/auth',authRoutes);

app.use(errorHandler);

app.listen(port, () => {
  connectDb();
  console.log("App listening on Port : ", port);
});
