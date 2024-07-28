import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  FollowUnfollowDto,
  SignInUserDto,
  SignupUserDto,
  updateUserDto,
} from "../dto/userDto";
import {
  CommonResponseModel,
  ErrorResponseModel,
  SuccessResponseModel,
} from "../shared/responseModel";
import { UserModel } from "../dto/entity/user.entity";
import { convertToObject } from "typescript";
import mongoose from "mongoose";

export class UserService {
  private readonly saltRounds: number = 10;

  async signUpUser(
    req: Request,
    res: Response,
    payload: SignupUserDto
  ): Promise<CommonResponseModel> {
    try {
      // Check  if the phoneNumber and email already exist
      const phoneNumberExist = await UserModel.findOne({
        phoneNumber: payload.phoneNumber,
      });
      if (phoneNumberExist) {
        return new ErrorResponseModel(400, "Phone number already exists", {});
      }
      const emailExist = await UserModel.findOne({
        email: payload.email,
      });
      if (emailExist) {
        return new ErrorResponseModel(400, "Email already exists", {});
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(
        payload.password,
        this.saltRounds
      );
      // // Prepare user data
      const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phoneNumber: payload.phoneNumber,
      };
      // Save user data to database
      const newUser = new UserModel(userData);
      await newUser.save();

      // Generate Token
      const userJwt = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
        },
        // process.env.JWT_KEY! // ! is used to make sure ent variable is 100% defined
        "abcdef"
      );
      // Store in session
      req.session = {
        jwt: userJwt,
      };

      return new SuccessResponseModel(200, "User onboarded successfully", {
        ...userData,
      });
    } catch (error) {
      console.error("Error during user sign-up:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  async signInUser(
    req: Request,
    res: Response,
    payload: SignInUserDto
  ): Promise<CommonResponseModel> {
    try {
      // Check if user exist
      const user = await UserModel.findOne({
        email: payload.email,
      });
      if (!user) {
        return new ErrorResponseModel(400, "Invalid credentials", {});
      }
      // Check if password is correct
      const passwordMatch = await bcrypt.compare(
        payload.password,
        user.password
      );
      if (!passwordMatch) {
        return new ErrorResponseModel(400, "Invalid credentials", {});
      }
      // Generate Token
      const userJwt = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        // process.env.JWT_KEY! // ! is used to make sure ent variable is 100% defined
        "abcdef"
      );
      // Store in session
      req.session = {
        jwt: userJwt,
      };

      return new SuccessResponseModel(200, "User signed in successfully", {
        ...user.toJSON(),
      });
    } catch (error) {
      console.error("Error during user sign-in:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Update user
  async updateUser(
    req: Request,
    res: Response,
    payload: updateUserDto
  ): Promise<CommonResponseModel> {
    try {
      // Extract the JWT token from the session
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if user exists
      const user = await UserModel.findOne(userIdObject);
      if (!user) {
        return new ErrorResponseModel(400, "User not found", {});
      }

      // Prepare user data
      const userData = {
        name: payload.name || user.name,
        email: user.email, // Email should not be updated
        phoneNumber: payload.phoneNumber || user.phoneNumber,
      };

      // Update user data in the database
      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        userData,
        { new: true }
      );

      // Generate a new token with updated information
      const userJwt = jwt.sign(
        {
          id: updatedUser?._id,
          email: updatedUser?.email,
        },
        process.env.JWT_KEY!
      );

      // Store the new token in the session
      if (req.session) {
        req.session.jwt = userJwt;
      }

      return new SuccessResponseModel(200, "User updated successfully", {
        ...updatedUser?.toJSON(),
      });
    } catch (error) {
      console.error("Error during user update:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Get user
  async getUser(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      // Extract the JWT token from the session
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: any; // Declare userIdObject variable
      try {
        decoded = jwt.verify(token, "abcdef") as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if user exists
      const user = await UserModel.findOne(userIdObject);
      if (!user) {
        return new ErrorResponseModel(400, "User not found", {});
      }

      return new SuccessResponseModel(200, "User found", {
        ...user.toJSON(),
      });
    } catch (error) {
      console.error("Error during user get:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Follow/Unfollow user
  async followUnfollow(
    req: Request,
    res: Response,
    payload: FollowUnfollowDto
  ): Promise<CommonResponseModel> {
    try {
      // Extract the JWT token from the session
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, "abcdef") as JwtPayload;
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Convert the decoded user ID and payload user ID to ObjectId
      const userIdObject = new mongoose.Types.ObjectId(decoded.id);
      const payloadUserIdObject = new mongoose.Types.ObjectId(payload.userId);

      if (userIdObject.toString() === payloadUserIdObject.toString()) {
        return new ErrorResponseModel(
          400,
          "You can't follow/unfollow yourself",
          {}
        );
      }

      // Check if the user is already following the target user
      const user = await UserModel.findById(userIdObject);
      const isFollowing =
        payload.userId && user?.following.includes(payload.userId);

      if (isFollowing) {
        // Unfollow logic
        await UserModel.findByIdAndUpdate(
          userIdObject,
          { $pull: { following: payload.userId } },
          { new: true }
        );
        await UserModel.findByIdAndUpdate(
          payloadUserIdObject,
          { $pull: { followers: decoded.id } },
          { new: true }
        );

        return new SuccessResponseModel(
          200,
          "User unfollowed successfully",
          {}
        );
      } else {
        // Follow logic
        await UserModel.findByIdAndUpdate(
          userIdObject,
          { $addToSet: { following: payload.userId } },
          { new: true }
        );
        await UserModel.findByIdAndUpdate(
          payloadUserIdObject,
          { $addToSet: { followers: decoded.id } },
          { new: true }
        );

        return new SuccessResponseModel(200, "User followed successfully", {});
      }
    } catch (error) {
      console.error("Error during follow/unfollow:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Search user
  async searchUser(
    req: Request,
    res: Response,
    query: string
  ): Promise<CommonResponseModel> {
    try {
      // Extract the JWT token from the session
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, "abcdef") as JwtPayload;
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if user exists
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return new ErrorResponseModel(400, "User not found", {});
      }
      // Search for users
      const users = await UserModel.find({
        name: { $regex: query, $options: "i" },
      });

      if (users.length > 0) {
        return new SuccessResponseModel(200, "Users found", {
          users: users.map((user) => user.toObject()),
        });
      } else {
        return new SuccessResponseModel(200, "No user found", {});
      }
    } catch (error) {
      console.error("Error during user search:", error);
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }
}
