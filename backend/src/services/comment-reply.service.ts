import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateCommentReplyDto } from "@/dtos/post.dto";
import { CommentReply } from "@/entities/post-comment-reply.entity";
import { QueueService, QueueName, JobType } from "./queue.service";
export class CommentReplyService {
  private replyRepository: Repository<CommentReply>;
  private queueService: QueueService;

  constructor() {
    this.replyRepository = AppDataSource.getRepository(CommentReply);
    this.queueService = QueueService.getInstance();
  }

  async findByCommentId(commentId: number): Promise<CommentReply[]> {
    return this.replyRepository.find({
      where: { comment: { id: commentId } },
      relations: ["author", "childReplies", "childReplies.author", "likes", "likes.employee"],
      order: { createdAt: "ASC" },
    });
  }

  async findByParentReplyId(parentReplyId: number): Promise<CommentReply[]> {
    return this.replyRepository.find({
      where: { parentReply: { id: parentReplyId } },
      relations: ["author", "childReplies", "childReplies.author", "likes", "likes.employee"],
      order: { createdAt: "ASC" },
    });
  }

  async findById(id: number): Promise<CommentReply | null> {
    return this.replyRepository.findOne({
      where: { id },
      relations: ["author", "comment", "parentReply", "childReplies", "childReplies.author", "likes", "likes.employee"],
    });
  }

  async create(createReplyDto: CreateCommentReplyDto): Promise<CommentReply> {
    const reply = this.replyRepository.create(createReplyDto);

    await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.COMMENT_REPLIED, {
      sender: reply.author,
      parentCommentAuthorId: reply.parentReply?.authorId,
      commentContent: reply.content,
      postId: reply.comment.post.id,
    });
    return this.replyRepository.save(reply);
  }

  async delete(id: number): Promise<void> {
    await this.replyRepository.delete(id);
  }
}
