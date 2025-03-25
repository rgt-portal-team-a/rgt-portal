import { AppDataSource } from "@/database/data-source";
import { CreateReactionDto } from "@/dtos/post.dto";
import { PostReaction } from "@/entities/post-reactions.entity";
import { Repository } from "typeorm";

export class PostReactionService {
  private reactionRepository: Repository<PostReaction>;

  constructor() {
    this.reactionRepository = AppDataSource.getRepository(PostReaction);
  }

  async findByPostId(postId: number): Promise<PostReaction[]> {
    return this.reactionRepository.find({
      where: { post: { id: postId } },
      relations: ["employee"],
    });
  }

  async toggleReaction(createReactionDto: CreateReactionDto): Promise<PostReaction> {
    const existingReaction = await this.reactionRepository.findOne({
      where: {
        post: { id: createReactionDto.postId },
        employee: { id: createReactionDto.employeeId },
      },
    });

    if (existingReaction) {
      if (existingReaction.emoji === createReactionDto.emoji) {
        await this.reactionRepository.remove(existingReaction);
        return existingReaction;
      }
      existingReaction.emoji = createReactionDto.emoji;
      return this.reactionRepository.save(existingReaction);
    }

    const reaction = this.reactionRepository.create(createReactionDto);
    return this.reactionRepository.save(reaction);
  }
}
