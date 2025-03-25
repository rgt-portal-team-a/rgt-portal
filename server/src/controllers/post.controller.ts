import { Request, Response } from "express";
import { validate } from "class-validator";
import { PostService } from "@/services/post.service";
import { Logger } from "@/services/logger.service";
import { ApiResponse } from "@/dtos/response.dto";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";

export class PostController {
  private postService: PostService;
  private logger: Logger;

  constructor() {
    this.postService = new PostService();
    this.logger = new Logger("PostController");
  }

  public findPostById = async (postId: number): Promise<any> => {
    try {
      console.log("PostId:", postId);
      const post = await this.postService.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    } catch (error) {
      this.logger.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  };

  public getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      console.log("page, limit:", page, limit);

      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid page or limit value",
        });
        return;
      }

      const result = await this.postService.findAllWithInteractions(page, limit);

      const response: ApiResponse<typeof result.posts> = {
        success: true,
        data: result.posts,
        metadata: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error fetching posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch posts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id);
      console.log("PostID:", postId);
      const post = await this.postService.findById(postId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
        return;
      }

      const response: ApiResponse<typeof post> = {
        success: true,
        data: post,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching post ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch post",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("body:", req.body);
      const postData: CreatePostDto = req.body;
      postData.authorId = (req.user as any).employee.id;

      const errors = await validate(postData);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((error: any) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const newPost = await this.postService.create(postData);

      const response: ApiResponse<typeof newPost> = {
        success: true,
        data: newPost,
        message: "Post created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create post",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id);
      const updateData: UpdatePostDto = req.body;

      const existingPost = await this.postService.findById(postId);

      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
        return;
      }

      if (existingPost.authorId !== (req as any).user.id) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to update this post",
        });
        return;
      }

      const updatedPost = await this.postService.update(postId, updateData);

      const response: ApiResponse<typeof updatedPost> = {
        success: true,
        data: updatedPost,
        message: "Post updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error updating post ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update post",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id);
      const existingPost = await this.postService.findById(postId);

      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
        return;
      }

      if (existingPost.authorId !== (req as any).user.id) {
        res.status(403).json({
          success: false,
          message: "Unauthorized to delete this post",
        });
        return;
      }

      await this.postService.softDelete(postId);

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      this.logger.error(`Error deleting post ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to delete post",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getPostStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = parseInt(req.params.id);
      const stats = await this.postService.getPostStats(postId);

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error(`Error fetching post stats ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch post statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
