import * as Joi from "joi";

export class createPostDto {
  content?: string;
  userId: string;
  image?: string;
  tags?: [];

  constructor(userId: string, content?: string, image?: string, tags?: []) {
    this.content = content;
    this.userId = userId;
    this.image = image;
    this.tags = tags;
  }

  static validationSchema = Joi.object({
    content: Joi.string().optional(),
    userId: Joi.string().required(),
    image: Joi.string().optional(),
    tags: Joi.array().optional(),
  });
}
