import * as Joi from "joi";

export class SignupUserDto {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;

  constructor(
    name: string,
    email: string,
    password: string,
    phoneNumber: string
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phoneNumber = phoneNumber;
  }

  static validationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().required(),
  });
}

export class SignInUserDto {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
}

export class updateUserDto {
  name?: string;
  email?: string;
  phoneNumber?: string;

  constructor(name?: string, email?: string, phoneNumber?: string) {
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }

  static validationSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().optional(),
  });
}

export class FollowUnfollowDto {
  userId?: string;
  constructor(userId?: string) {
    this.userId = userId;
  }
  static validationSchema = Joi.object({
    userId: Joi.string().required(),
  });
}
