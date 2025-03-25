import { Repository } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { CreateCommentDto } from "@/dtos/post.dto";
import { PostComment } from "@/entities/post-comment.entity";

export class PostCommentService {
  private commentRepository: Repository<PostComment>;

  constructor() {
    this.commentRepository = AppDataSource.getRepository(PostComment);
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
    return this.commentRepository.save(comment);
  }

  async delete(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
