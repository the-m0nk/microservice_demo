import express from "express";
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";
import { postRoute } from "./routes/postRoutes";

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

app.use(postRoute);

// Connect to the DB
const start = async () => {
  // if (!process.env.JWT_KEY) {    // this used when we save our jwt key on k8 cluster
  //   throw new Error("JWT_KEY must be defined");
  // }
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be defined");
    }
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Post Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Post Server is running on port 3000");
  });
};

start();
