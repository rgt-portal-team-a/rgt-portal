import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateLikeDto } from "@/dtos/post.dto";
import { PostLike } from "@/entities/post-like.entity";

export class PostLikeService {
  private likeRepository: Repository<PostLike>;

  constructor() {
    this.likeRepository = AppDataSource.getRepository(PostLike);
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

    const like = this.likeRepository.create(createLikeDto);
    return this.likeRepository.save(like);
  }
}
