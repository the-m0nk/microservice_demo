import express, { Request, Response } from "express";
import { postService as PostService } from "../service/postService"; // Rename the import to avoid naming conflict
import {
  ErrorResponseModel,
  SuccessResponseModel,
} from "../shared/responseModel";
import { createPostDto } from "../dto/postDto";
import multer from "multer";
import path from "path";

// Configure Multer S# bucket
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

const upload = multer({ storage });

const router = express.Router();
const postService = new PostService();

// Using Multer but can also use S
router.post(
  "/api/post/createPost",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const payload: createPostDto = req.body;
    if (req.file) {
      payload.image = req.file.path;
    }
    try {
      const result = await postService.createPost(req, res, payload);
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
  }
);

router.get("/api/post/getPost", async (req, res) => {
  try {
    const result = await postService.getPost(req, res);
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

// get post by Id
router.get("/api/post/getPostById/:id", async (req, res) => {
  try {
    const result = await postService.getPostById(req, res);
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

// Update post
router.put(
  "/api/post/updatePost/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const payload: createPostDto = req.body;
    if (req.file) {
      payload.image = req.file.path;
    }
    try {
      const result = await postService.updatePost(req, res, payload);
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
  }
);

// Delete post
router.delete("/api/post/deletePost/:id", async (req, res) => {
  try {
    const result = await postService.deletePost(req, res);
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

// Like Post
router.put("/api/post/likePost/:id", async (req, res) => {
  try {
    const result = await postService.likePost(req, res);
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

// Comment on post
router.put("/api/post/commentPost", async (req, res) => {
  try {
    const result = await postService.commentPost(req, res);
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

// Reply to cooment
router.put("/api/post/replyComment", async (req, res) => {
  try {
    const result = await postService.replyComment(req, res);
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

// search post using Elastic search
router.get("/api/post/searchPost", async (req, res) => {
  try {
    const result = await postService.searchPost(req, res);
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

export { router as postRoute };
