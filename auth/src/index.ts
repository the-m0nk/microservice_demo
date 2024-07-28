import express from "express";
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { userRoute } from "./routes/userRoute";

const app = express();

// Middlewares
app.use(json());

// Trust the ingress-nginx proxy
app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);

app.use(userRoute);

// Connect to the DB
const start = async () => {
  // if (!process.env.JWT_KEY) {
  //   throw new Error("JWT_KEY must be defined");
  // }
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be defined");
    }
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Auth Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Auth Server is running on port 3000");
  });
};

start();
