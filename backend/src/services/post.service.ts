import { Repository } from "typeorm";
import { Post } from "../entities/post.entity";
import { AppDataSource } from "@/database/data-source";
import { CreatePostDto, UpdatePostDto } from "@/dtos/post.dto";

export class PostService {
  private postRepository: Repository<Post>;

  constructor() {
    this.postRepository = AppDataSource.getRepository(Post);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<[Post[], number]> {
    return this.postRepository.findAndCount({
      where: { isActive: true },
      relations: ["author", "likes", "reactions", "comments", "comments.author"],
      order: { publishDate: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: number): Promise<Post | null> {
    console.log("id:", id);
    if (isNaN(id)) {
      throw new Error("Invalid post ID");
    }
    return this.postRepository.findOne({
      where: { id, isActive: true },
      relations: ["author", "likes", "reactions", "comments", "comments.author"],
    });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId, isActive: true },
      relations: ["likes", "reactions", "comments"],
      order: { publishDate: "DESC" },
    });
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    await this.postRepository.update(id, updatePostDto);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.postRepository.update(id, { isActive: false });
  }

  async getPostStats(postId: number): Promise<{
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    comments: {
      // id: number;
      content: string;
      createdAt: Date;
      author: {
        // id: number;
        firstName: string;
        lastName: string;
        profileImage: string;
      };
    }[];
    reactionsByEmoji: Record<string, number>;
  }> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ["likes", "reactions", "comments", "comments.author", "comments.author.user"],
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const reactionsByEmoji = post.reactions.reduce(
      (acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      likesCount: post.likes.filter((like) => like.isLike).length,
      dislikesCount: post.likes.filter((like) => !like.isLike).length,
      comments: post.comments
        .filter((comment) => comment.author) // Filter out comments without an author
        .map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            id: comment.author.id,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            profileImage: comment.author.user?.profileImage || "", 
          },
        })),
      commentsCount: post.comments.length,
      reactionsByEmoji,
    };
  }

  async findAllWithInteractions(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    posts: {
      id: number;
      content: string;
      media?: Record<string, any> | null;
      publishDate: Date;
      author: {
        id: number;
        firstName: string;
        lastName: string;
        profileImage?: string;
      };
      comments: {
        id: number;
        content: string;
        createdAt: Date;
        author: {
          id: number;
          firstName: string;
          lastName: string;
          profileImage?: string;
        };
        likes: {
          id: number;
          employeeId: number;
          isLike: boolean;
        }[];
        reactions: {
          id: number;
          employeeId: number;
          emoji: string;
        }[];
      }[];
      likes: {
        id: number;
        employeeId: number;
        isLike: boolean;
      }[];
      reactions: {
        id: number;
        employeeId: number;
        emoji: string;
      }[];
      stats: {
        totalComments: number;
        totalLikes: number;
        totalDislikes: number;
        reactionCounts: Record<string, number>;
      };
    }[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Validate page and limit
    if (isNaN(page)) page = 1;
    if (isNaN(limit)) limit = 10;

    console.log("page:", page);
    console.log("limit:", limit);

    const [posts, total] = await this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("author.user", "user") 
      .leftJoinAndSelect("comments.author", "commentAuthor")
      // .leftJoinAndSelect("comments.likes", "commentLikes")
      // .leftJoinAndSelect("comments.reactions", "commentReactions")
      .leftJoinAndSelect("post.likes", "postLikes")
      .leftJoinAndSelect("post.reactions", "postReactions")
      .where("post.isActive = :isActive", { isActive: true })
      .orderBy("post.publishDate", "DESC")
      .addOrderBy("comments.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    console.log("postsRepo...:", posts);

    const formattedPosts = posts.map((post) => {
      const stats = {
        totalComments: post.comments.length,
        totalLikes: post.likes.filter((like) => like.isLike).length,
        totalDislikes: post.likes.filter((like) => !like.isLike).length,
        reactionCounts: post.reactions.reduce(
          (acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };

      const formattedComments = post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          profileImage: comment.author.user?.profileImage,
        },
        likes: (comment as any).likes || [],
        reactions: (comment as any).reactions || [],
      }));

      return {
        id: post.id,
        content: post.content,
        media: post.media,
        publishDate: post.publishDate,
        author: {
          id: post.author.id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          profileImage: post.author.user?.profileImage,
        },
        comments: formattedComments,
        likes: post.likes,
        reactions: post.reactions,
        stats,
      };
    });

    return {
      posts: formattedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
