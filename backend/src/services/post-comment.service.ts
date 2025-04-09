import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateCommentDto } from "@/dtos/post.dto";
import { PostComment } from "@/entities/post-comment.entity";
import { JobType, QueueName, QueueService } from "./queue.service";
import { Employee } from "@/entities/employee.entity";
import { Post } from "@/entities/post.entity";

export class PostCommentService {
  private commentRepository: Repository<PostComment>;
  private queueService: QueueService;
  private employeeRepository: Repository<Employee>;
  private postRepository: Repository<Post>;

  constructor() {
    this.commentRepository = AppDataSource.getRepository(PostComment);
    this.queueService = QueueService.getInstance();
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.postRepository = AppDataSource.getRepository(Post);
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
    console.log(comment);
    // GET SENDER AND POST 
    const sender = await this.employeeRepository.findOne({
      where: { id: comment.authorId },
      relations: ["user"],
    });

    const post = await this.postRepository.findOne({
      where: { id: comment.post.id },
      relations: ["author"],
    });

    await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.POST_COMMENTED, {
      sender: sender,
      post: post,
      commentContent: comment.content,
    });

    return this.commentRepository.save(comment);
  }

  async delete(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
