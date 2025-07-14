import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors  from "cors"
dotenv.config();

const startApp = async () => {
  const express = (await import('express')).default;
  const authRoutes = (await import('./routes/index.js')).default;
  const connectDb = (await import('./db.js')).default;
  const { errorHandler } = await import('./middlewares/errorMiddleware.js');

  const app = express();
  const port = process.env.PORT;
  app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use(errorHandler);

  app.listen(port, () => {
    connectDb();
    console.log("App listening on Port:", port);
  });
};

startApp();



/*

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

*/