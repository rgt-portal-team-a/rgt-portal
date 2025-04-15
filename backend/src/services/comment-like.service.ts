import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateCommentLikeDto } from "@/dtos/post.dto";
import { CommentLike } from "@/entities/post-comment-like.entity";
import { QueueService, QueueName, JobType } from "./queue.service";

export class CommentLikeService {
  private likeRepository: Repository<CommentLike>;
  private queueService: QueueService;

  constructor() {
    this.likeRepository = AppDataSource.getRepository(CommentLike);
    this.queueService = QueueService.getInstance();
  }

  async findByCommentId(commentId: number): Promise<CommentLike[]> {
    return this.likeRepository.find({
      where: { comment: { id: commentId } },
      relations: ["employee"],
    });
  }

  async findByReplyId(replyId: number): Promise<CommentLike[]> {
    return this.likeRepository.find({
      where: { reply: { id: replyId } },
      relations: ["employee"],
    });
  }

  async toggleCommentLike(likeDto: CreateCommentLikeDto): Promise<CommentLike | null> {
    const existingLike = await this.likeRepository.findOne({
      where: {
        ...(likeDto.commentId ? { comment: { id: likeDto.commentId } } : {}),
        ...(likeDto.replyId ? { reply: { id: likeDto.replyId } } : {}),
        employee: { id: likeDto.employeeId },
      },
      relations: ["comment", "reply", "employee"],
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      return null;
    }

    const like = this.likeRepository.create(likeDto);

    const savedLike = await this.likeRepository.findOne({
      where: {
        id: like.id,
      },
      relations: ["employee", "employee.user", "comment", "reply"],
    });

    await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.COMMENT_LIKED, {
      sender: savedLike?.employee.user,
      commentAuthorId: savedLike?.comment?.authorId,
      commentContent: savedLike?.comment?.content,
      commentId: savedLike?.comment?.id,
    });

    return this.likeRepository.save(like);
  }

  async delete(id: number): Promise<void> {
    await this.likeRepository.delete(id);
  }
}
