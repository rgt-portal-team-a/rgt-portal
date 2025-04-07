import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateLikeDto } from "@/dtos/post.dto";
import { PostLike } from "@/entities/post-like.entity";
import { QueueService, QueueName, JobType } from "./queue.service";
import { Employee } from "@/entities/employee.entity";
import { Post } from "@/entities/post.entity";

export class PostLikeService {
  private likeRepository: Repository<PostLike>;
  private queueService: QueueService;
  private employeeRepository: Repository<Employee>;
  private postRepository: Repository<Post>;

  constructor() {
    this.likeRepository = AppDataSource.getRepository(PostLike);
    this.queueService = QueueService.getInstance();
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.postRepository = AppDataSource.getRepository(Post);
  }

  async findByPostId(postId: number): Promise<PostLike[]> {
    return this.likeRepository.find({
      where: { post: { id: postId } },
      relations: ["employee"],
    });
  }

  async toggleLike(createLikeDto: CreateLikeDto): Promise<PostLike> {
    const existingLike = await this.likeRepository.findOne({
      where: {
        post: { id: createLikeDto.postId },
        employee: { id: createLikeDto.employeeId },
        employeeId: createLikeDto.employeeId,
      },
      relations:['post', "employee"]
    });

    if (existingLike) {
      if (existingLike.isLike === createLikeDto.isLike) {
        await this.likeRepository.remove(existingLike);
        return existingLike;
      }
      existingLike.isLike = createLikeDto.isLike;
      return this.likeRepository.save(existingLike);
    }

    const likeOwner = await this.employeeRepository.findOne({
      where: { id: createLikeDto.employeeId },
      relations: ["user"],
    });

    const post = await this.postRepository.findOne({
      where: { id: createLikeDto.postId },
      relations: ["author"],
    });

    await this.queueService.addJob(QueueName.NOTIFICATIONS, JobType.POST_LIKED, {
      sender: likeOwner,
      post: post,
    });

    const like = this.likeRepository.create(createLikeDto);
    return this.likeRepository.save(like);
  }
}
