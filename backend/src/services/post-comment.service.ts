import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateCommentDto } from "@/dtos/post.dto";
import { PostComment } from "@/entities/post-comment.entity";
import { JobType, QueueName, QueueService } from "./queue.service";

export class PostCommentService {
  private commentRepository: Repository<PostComment>;
  private queueService: QueueService;

  constructor() {
    this.commentRepository = AppDataSource.getRepository(PostComment);
    this.queueService = QueueService.getInstance();
  }

  async findByPostId(postId: number): Promise<PostComment[]> {
    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ["author", "replies", "replies.author", "likes", "likes.employee"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<PostComment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ["author", "replies", "replies.author", "likes", "likes.employee"],
    });
  }

  async create(createCommentDto: CreateCommentDto): Promise<PostComment> {
    const comment = this.commentRepository.create(createCommentDto);

    await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.POST_COMMENTED, {
      sender: comment.author,
      post: comment.post,
      commentContent: comment.content,
    });

    return this.commentRepository.save(comment);
  }

  async delete(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
