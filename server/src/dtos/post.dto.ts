import { Employee, Post } from "@/entities";

export interface CreatePostDto {
  content: string;
  media?: string[];
  authorId: number;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  isActive?: boolean;
}

export interface CreateCommentDto {
  postId: number;
  authorId: number;
  content: string;
  // new code
  post: { id: number };
  author: { id: number };
}

export interface CreateReactionDto {
  postId: number;
  employeeId: number;
  emoji: string;
}

export interface CreateLikeDto {
  postId: number;
  employeeId: number;
  isLike: boolean;
  post: { id: number };
  employee: { id: number };
}

export interface CreateCommentReplyDto {
  commentId: number;
  parentReplyId?: number;
  authorId: number;
  content: string;
  comment: { id: number };
  parentReply?: { id: number };
  author: { id: number };
}

export interface CreateCommentLikeDto {
  commentId?: number;
  replyId?: number;
  employeeId: number;
  comment?: { id: number };
  reply?: { id: number };
  employee: { id: number };
}
