import { Request, Response } from "express";
import { PostCommentService } from "@/services/post-comment.service";
import { PostReactionService } from "@/services/post-reaction.service";
import { PostLikeService } from "@/services/post-like.service";
import { CommentReplyService } from "@/services/comment-reply.service";
import { CommentLikeService } from "@/services/comment-like.service";
import { CreateCommentDto, CreateLikeDto, CreateReactionDto, CreateCommentReplyDto, CreateCommentLikeDto } from "@/dtos/post.dto";
import { ApiResponse } from "@/dtos/response.dto";
import { Logger } from "@/services/logger.service";

export class PostInteractionController {
  private commentService: PostCommentService;
  private reactionService: PostReactionService;
  private likeService: PostLikeService;
  private replyService: CommentReplyService;
  private commentLikeService: CommentLikeService;
  private logger: Logger;

  constructor() {
    this.commentService = new PostCommentService();
    this.reactionService = new PostReactionService();
    this.likeService = new PostLikeService();
    this.replyService = new CommentReplyService();
    this.commentLikeService = new CommentLikeService();
    this.logger = new Logger("PostInteractionController");
  }

  public createComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const commentData: CreateCommentDto = {
        postId: parseInt(req.params.postId),
        authorId: (req as any).user?.id,
        content: req.body.content,
        post: { id: parseInt(req.params.postId) },
        author: { id: (req as any).user?.employee.id },
      };

      const newComment = await this.commentService.create(commentData);

      const response: ApiResponse<typeof newComment> = {
        success: true,
        data: newComment,
        message: "Comment created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create comment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public toggleReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const reactionData: CreateReactionDto = {
        postId: parseInt(req.params.postId),
        employeeId: (req as any).user?.id,
        emoji: req.body.emoji,
      };

      const reaction = await this.reactionService.toggleReaction(reactionData);

      const response: ApiResponse<typeof reaction> = {
        success: true,
        data: reaction,
        message: "Reaction toggled successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error toggling reaction:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle reaction",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public toggleLike = async (req: Request, res: Response): Promise<void> => {
    try {
      const likeData: CreateLikeDto = {
        postId: parseInt(req.params.postId),
        employeeId: (req as any).user?.employee.id,
        isLike: req.body.isLike,
        post: { id: parseInt(req.params.postId) },
        employee: { id: (req as any).user?.employee.id },
      };

      const like = await this.likeService.toggleLike(likeData);

      const response: ApiResponse<typeof like> = {
        success: true,
        data: like,
        message: "Like toggled successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error toggling like:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle like",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public createCommentReply = async (req: Request, res: Response): Promise<void> => {
    try {
      const replyData: CreateCommentReplyDto = {
        commentId: parseInt(req.params.commentId),
        authorId: (req as any).user?.employee.id,
        content: req.body.content,
        comment: { id: parseInt(req.params.commentId) },
        author: { id: (req as any).user?.employee.id },
      };

      // If replying to another reply, include parentReplyId
      if (req.body.parentReplyId) {
        replyData.parentReplyId = parseInt(req.body.parentReplyId);
        replyData.parentReply = { id: parseInt(req.body.parentReplyId) };
      }

      const newReply = await this.replyService.create(replyData);

      const response: ApiResponse<typeof newReply> = {
        success: true,
        data: newReply,
        message: "Reply created successfully",
      };

      res.status(201).json(response);
    } catch (error) {
      this.logger.error("Error creating reply:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create reply",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public toggleCommentLike = async (req: Request, res: Response): Promise<void> => {
    try {
      const likeData: CreateCommentLikeDto = {
        employeeId: (req as any).user?.employee.id,
        employee: { id: (req as any).user?.employee.id },
      };

      // Determine if we're liking a comment or a reply
      if (req.params.commentId) {
        likeData.commentId = parseInt(req.params.commentId);
        likeData.comment = { id: parseInt(req.params.commentId) };
      } else if (req.params.replyId) {
        likeData.replyId = parseInt(req.params.replyId);
        likeData.reply = { id: parseInt(req.params.replyId) };
      } else {
         res.status(400).json({
          success: false,
          message: "Either commentId or replyId must be provided",
        });
      }

      const like = await this.commentLikeService.toggleCommentLike(likeData);

      const response: ApiResponse<typeof like> = {
        success: true,
        data: like,
        message: "Comment like toggled successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error toggling comment like:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle comment like",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getCommentReplies = async (req: Request, res: Response): Promise<void> => {
    try {
      const commentId = parseInt(req.params.commentId);
      const replies = await this.replyService.findByCommentId(commentId);

      const response: ApiResponse<typeof replies> = {
        success: true,
        data: replies,
        message: "Comment replies retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error retrieving comment replies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comment replies",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getReplyReplies = async (req: Request, res: Response): Promise<void> => {
    try {
      const replyId = parseInt(req.params.replyId);
      const replies = await this.replyService.findByParentReplyId(replyId);

      const response: ApiResponse<typeof replies> = {
        success: true,
        data: replies,
        message: "Reply responses retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      this.logger.error("Error retrieving reply responses:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve reply responses",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
