import express, { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  FollowUnfollowDto,
  SignInUserDto,
  SignupUserDto,
  updateUserDto,
} from "../dto/userDto";
import {
  ErrorResponseModel,
  SuccessResponseModel,
} from "../shared/responseModel";

const router = express.Router();
const userService = new UserService();

router.post("/api/users/signup", async (req: Request, res: Response) => {
  const payload: SignupUserDto = req.body;
  try {
    const result = await userService.signUpUser(req, res, payload);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/api/users/signin", async (req: Request, res: Response) => {
  const payload: SignInUserDto = req.body;
  try {
    const result = await userService.signInUser(req, res, payload);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/api/users/update-user", async (req: Request, res: Response) => {
  const payload: updateUserDto = req.body;
  try {
    const result = await userService.updateUser(req, res, payload);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/api/users/followUnfollow", async (req, res) => {
  const payload: FollowUnfollowDto = req.body;
  try {
    const result = await userService.followUnfollow(req, res, payload);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/api/users/search-user", async(req: Request, res) => {
  const query = req.query.search as string;
  try {
    const result = await userService.searchUser(req, res, query);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/api/users/get-user", async (req, res) => {
  try {
    const result = await userService.getUser(req, res);
    if (result instanceof SuccessResponseModel) {
      res.status(result.status).json(result);
    } else if (result instanceof ErrorResponseModel) {
      res.status(result.status).json(result);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export { router as userRoute };
