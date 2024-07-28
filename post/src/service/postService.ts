import { Request, Response } from "express";
import { Client } from "@elastic/elasticsearch";
import { createPostDto } from "../dto/postDto";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { postModel } from "../dto/entity.ts/post.entity";
import {
  CommonResponseModel,
  ErrorResponseModel,
  SuccessResponseModel,
} from "../shared/responseModel";
import { CommentModel } from "../dto/entity.ts/comment.entity";

const elasticClient = new Client({
  node: "https://d42fb56c1df7777eb31362e7a07fce19.us-central1.gcp.cloud.es.io:443", // Use Node url
  auth: {
    username: "f76f181c809245d1bbafbf80mmccc6931", // use Elastic search username
    password:
      "dXMtY2VudHJhbDEsb3VkLmVzLmlvJGQ0MmZiNTZjMWRmZDQ0N2ViMzEzNjJlN2EwN2ZjZTE5JGI1N2ZkODc1ZjNmYTQ1YjVhOWM3NDQxYTExOTRlZDM2", // Password
  },
});

async function testConnection() {
  try {
    const body = await elasticClient.ping();
    console.log("Elasticsearch connection successful:", body);
  } catch (error) {
    console.error("Elasticsearch connection error:", error);
  }
}

testConnection();

async function createIndex() {
  try {
    await elasticClient.indices.create({
      index: "posts",
      body: {
        mappings: {
          properties: {
            content: { type: "text" },
            userId: { type: "text" },
            image: { type: "text" },
            tags: { type: "keyword" },
            createdAt: { type: "date" },
          },
        },
      },
    });
    console.log("Index created successfully");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

createIndex();

async function indexPost(post: any) {
  await elasticClient.index({
    index: "posts",
    id: post._id.toString(),
    body: {
      content: post.content,
      userId: post.userId,
      image: post.image,
      tags: post.tags,
      createdAt: post.createdAt,
    },
  });
}

export class postService {
  async createPost(
    req: Request,
    res: Response,
    payload: createPostDto
  ): Promise<CommonResponseModel> {
    try {
      // Get the data from JWT
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Add multiple tags
      let tagsArray: string[] = [];
      if (Array.isArray(payload.tags)) {
        tagsArray = payload.tags.map((tag: string) => tag.toLowerCase());
      }
      // Create the post data
      const postData = {
        content: payload.content,
        userId: userIdObject,
        image: payload.image || "",
        tags: tagsArray,
      };

      // Save the post in the database
      const post = new postModel(postData);
      await post.save();

      // Index the post in Elasticsearch
      // await elasticClient.index({
      //   index: "posts",
      //   id: (post._id as string).toString(),
      //   body: postData,
      // });

      return new SuccessResponseModel(200, "Post created successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // get All post
  async getPost(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }
      const posts = await postModel.find().sort({ createdAt: -1 });
      return new SuccessResponseModel(200, "Posts fetched successfully", {
        posts,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // get post by Id
  async getPostById(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }
      const postId = req.params.id;
      // const post = await postModel.findById(postId);
      const post = await postModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(postId) },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments",
          },
        },
        {
          $unwind: {
            path: "$comments",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.userId",
            foreignField: "_id",
            as: "comments.user",
          },
        },
        {
          $unwind: {
            path: "$comments.user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            content: { $first: "$content" },
            userId: { $first: "$userId" },
            image: { $first: "$image" },
            tags: { $first: "$tags" },
            createdAt: { $first: "$createdAt" },
            comments: {
              $push: {
                _id: "$comments._id",
                comment: "$comments.comment",
                userId: "$comments.userId",
                postId: "$comments.postId",
                createdAt: "$comments.createdAt",
                user: "$comments.user",
              },
            },
          },
        },
      ]);
      return new SuccessResponseModel(200, "Post fetched successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Update post
  async updatePost(
    req: Request,
    res: Response,
    payload: createPostDto
  ): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const postId = req.params.id;
      const post = await postModel.findById(postId);
      if (!post) {
        return new ErrorResponseModel(404, "Post not found", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if the user is the owner of the post
      if (post.userId.toString() !== userIdObject.toString()) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Update the post
      post.content = payload.content || post.content;
      post.image = payload.image || post.image;
      post.tags = payload.tags || post.tags;
      await post.save();

      return new SuccessResponseModel(200, "Post updated successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // delete post
  async deletePost(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const postId = req.params.id;
      const post = await postModel.findById(postId);
      if (!post) {
        return new ErrorResponseModel(404, "Post not found", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if the user is the owner of the post
      if (post.userId.toString() !== userIdObject.toString()) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      // Delete the post
      await postModel.findByIdAndDelete(postId);

      return new SuccessResponseModel(200, "Post deleted successfully", {});
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Like post
  async likePost(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const postId = req.params.id;
      const post = await postModel.findById(postId);
      if (!post) {
        return new ErrorResponseModel(404, "Post not found", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Check if the user has already liked the post
      const isLiked = post.like.includes(userIdObject.toString());
      if (isLiked) {
        // Unlike the post
        post.like = post.like.filter(
          (userId: string) => userId !== userIdObject.toString()
        );
      } else {
        // Like the post
        post.like.push(userIdObject.toString());
      }

      await post.save();

      return new SuccessResponseModel(200, "Post liked successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Comment on post
  async commentPost(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const postId = req.body.postId;
      const post = await postModel.findById(postId);
      if (!post) {
        return new ErrorResponseModel(404, "Post not found", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Add the comment
      let comment = {
        comment: req.body.comment,
        userId: userIdObject,
        postId: postId,
      };

      const commentData = new CommentModel(comment);
      commentData.save();

      return new SuccessResponseModel(200, "Comment added successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Reply to comment
  async replyComment(
    req: Request,
    res: Response
  ): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const postId = req.body.postId;
      const post = await postModel.findById(postId);
      if (!post) {
        return new ErrorResponseModel(404, "Post not found", {});
      }

      // Decode the token to get the user ID
      let decoded: JwtPayload;
      let userIdObject: mongoose.Types.ObjectId;
      try {
        decoded = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
        userIdObject = new mongoose.Types.ObjectId(decoded.id);
      } catch (error) {
        return new ErrorResponseModel(401, "Invalid token", {});
      }

      // Add the reply
      let reply = {
        comment: req.body.comment,
        userId: userIdObject,
      };

      const comment = await CommentModel.findById(req.body.commentId);
      if (!comment) {
        return new ErrorResponseModel(404, "Comment not found", {});
      }

      comment.replies.push(reply);
      await comment.save();

      return new SuccessResponseModel(200, "Reply added successfully", {
        post,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }

  // Search post using tags using elatic search
  async searchPost(req: Request, res: Response): Promise<CommonResponseModel> {
    try {
      const token = req.session?.jwt;
      if (!token) {
        return new ErrorResponseModel(401, "Unauthorized", {});
      }

      const query = req.query.q as string;

      const body = await elasticClient.search({
        index: "posts", // Assuming the index is named 'posts'
        body: {
          query: {
            match: {
              tags: query,
            },
          },
        },
      });

      const posts = body.hits.hits.map((hit: any) => hit._source);
      return new SuccessResponseModel(200, "Posts fetched successfully", {
        posts,
      });
    } catch (error) {
      return new ErrorResponseModel(500, "Internal Server Error", {});
    }
  }
}
