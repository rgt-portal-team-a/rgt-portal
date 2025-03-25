import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PostService } from "@/services/post.service";
import { PostLikeService } from "@/services/post-like.service";
import { PostCommentService } from "@/services/post-comment.service";
import { PostReactionService } from "@/services/post-reaction.service";
import { Post } from "@/entities/post.entity";
import { PostLike } from "@/entities/post-like.entity";
import { PostComment } from "@/entities/post-comment.entity";
import { PostReaction } from "@/entities/post-reactions.entity";
import { Employee } from "@/entities/employee.entity";
import { User } from "@/entities/user.entity";
import { Department } from "@/entities/department.entity";
import { AppDataSource } from "@/database/data-source";
import { Repository } from "typeorm";

vi.mock("@/database/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe("PostService", () => {
  let postService: PostService;
  let postLikeService: PostLikeService;
  let postCommentService: PostCommentService;
  let postReactionService: PostReactionService;
  let mockPostRepository: Repository<Post>;
  let mockPostLikeRepository: Repository<PostLike>;
  let mockPostCommentRepository: Repository<PostComment>;
  let mockPostReactionRepository: Repository<PostReaction>;

  const mockUser = {
    id: 1,
    username: "johndoe",
    profileImage: "profile.jpg",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    isActive: true,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: null,
  } as unknown as User;

  const mockDepartment = {
    id: 1,
    name: "Engineering",
    description: "Engineering Department",
    isActive: true,
    managerId: 1,
    manager: null,
    employees: [],
  } as unknown as Department;

  const mockEmployee = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    position: "Developer",
    hireDate: new Date(),
    departmentId: 1,
    isActive: true,
    phone: "",
    sickDaysBalance: 15,
    annualDaysOff: 30,
    vacationDaysBalance: 15,
    activePtoRequest: false,
    isSeniorTeamLead: false,
    isJuniorTeamLead: false,
    notes: "",
    contactDetails: {},
    givenRecognitions: [],
    receivedRecognitions: [],
    ptoRequests: [],
    projectAssignments: [],
    posts: [],
    organizedEvents: [],
    eventParticipations: [],
    attendanceRecords: [],
    createdPolls: [],
    pollVotes: [],
    user: mockUser,
    department: mockDepartment,
  } as Employee;

  const mockPost: Post = {
    id: 1,
    content: "Test post content",
    authorId: 1,
    publishDate: new Date(),
    isActive: true,
    author: mockEmployee,
    likes: [],
    reactions: [],
    comments: [],
  } as Post;

  beforeEach(() => {
    mockPostRepository = {
      findAndCount: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
    } as any;

    mockPostLikeRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    } as any;

    mockPostCommentRepository = {
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockPostReactionRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    } as any;

    (AppDataSource.getRepository as any).mockImplementation((entity: any) => {
      if (entity === Post) return mockPostRepository;
      if (entity === PostLike) return mockPostLikeRepository;
      if (entity === PostComment) return mockPostCommentRepository;
      if (entity === PostReaction) return mockPostReactionRepository;
      return {};
    });

    postService = new PostService();
    postLikeService = new PostLikeService();
    postCommentService = new PostCommentService();
    postReactionService = new PostReactionService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated posts with relations", async () => {
      const mockPosts = [mockPost];
      const mockCount = 1;
      (mockPostRepository.findAndCount as any).mockResolvedValue([mockPosts, mockCount]);

      const result = await postService.findAll(1, 10);

      expect(result).toEqual([mockPosts, mockCount]);
      expect(mockPostRepository.findAndCount).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ["author", "likes", "reactions", "comments", "comments.author"],
        order: { publishDate: "DESC" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("findById", () => {
    it("should return a post by id with relations", async () => {
      (mockPostRepository.findOne as any).mockResolvedValue(mockPost);

      const result = await postService.findById(1);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        relations: ["author", "likes", "reactions", "comments", "comments.author"],
      });
    });

    it("should throw error for invalid post id", async () => {
      await expect(postService.findById(NaN)).rejects.toThrow("Invalid post ID");
    });
  });

  describe("findByAuthor", () => {
    it("should return posts by author id", async () => {
      const mockPosts = [mockPost];
      (mockPostRepository.find as any).mockResolvedValue(mockPosts);

      const result = await postService.findByAuthor(1);

      expect(result).toEqual(mockPosts);
      expect(mockPostRepository.find).toHaveBeenCalledWith({
        where: { authorId: 1, isActive: true },
        relations: ["likes", "reactions", "comments"],
        order: { publishDate: "DESC" },
      });
    });
  });

  describe("create", () => {
    it("should create a new post", async () => {
      const createPostDto = {
        content: "New post content",
        authorId: 1,
      };
      (mockPostRepository.create as any).mockReturnValue(mockPost);
      (mockPostRepository.save as any).mockResolvedValue(mockPost);

      const result = await postService.create(createPostDto);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.create).toHaveBeenCalledWith(createPostDto);
      expect(mockPostRepository.save).toHaveBeenCalledWith(mockPost);
    });
  });

  describe("update", () => {
    it("should update an existing post", async () => {
      const updatePostDto = {
        content: "Updated content",
      };
      (mockPostRepository.update as any).mockResolvedValue({ affected: 1 } as any);
      (mockPostRepository.findOne as any).mockResolvedValue(mockPost);

      const result = await postService.update(1, updatePostDto);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.update).toHaveBeenCalledWith(1, updatePostDto);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        relations: ["author", "likes", "reactions", "comments", "comments.author"],
      });
    });
  });

  describe("softDelete", () => {
    it("should soft delete a post", async () => {
      await postService.softDelete(1);

      expect(mockPostRepository.update).toHaveBeenCalledWith(1, { isActive: false });
    });
  });

  describe("getPostStats", () => {
    it("should return post statistics including likes, dislikes, comments and reactions", async () => {
      const mockPostWithStats = {
        ...mockPost,
        likes: [
          { id: 1, employeeId: 1, isLike: true },
          { id: 2, employeeId: 2, isLike: false },
        ],
        reactions: [
          { id: 1, employeeId: 1, emoji: "👍" },
          { id: 2, employeeId: 2, emoji: "👍" },
          { id: 3, employeeId: 3, emoji: "❤️" },
        ],
        comments: [
          {
            id: 1,
            content: "Test comment",
            createdAt: new Date(),
            author: {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              user: { profileImage: "profile.jpg" },
            },
          },
        ],
      };

      (mockPostRepository.findOne as any).mockResolvedValue(mockPostWithStats);

      const result = await postService.getPostStats(1);

      expect(result).toEqual({
        likesCount: 1,
        dislikesCount: 1,
        commentsCount: 1,
        comments: [
          {
            id: 1,
            content: "Test comment",
            createdAt: expect.any(Date),
            author: {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              profileImage: "profile.jpg",
            },
          },
        ],
        reactionsByEmoji: {
          "👍": 2,
          "❤️": 1,
        },
      });
    });

    it("should throw error if post not found", async () => {
      (mockPostRepository.findOne as any).mockResolvedValue(null);

      await expect(postService.getPostStats(1)).rejects.toThrow("Post not found");
    });
  });

  describe("findAllWithInteractions", () => {
    it("should return posts with all interactions and stats", async () => {
      const mockPostWithInteractions = {
        ...mockPost,
        likes: [
          { id: 1, employeeId: 1, isLike: true },
          { id: 2, employeeId: 2, isLike: false },
        ],
        reactions: [
          { id: 1, employeeId: 1, emoji: "👍" },
          { id: 2, employeeId: 2, emoji: "👍" },
          { id: 3, employeeId: 3, emoji: "❤️" },
        ],
        comments: [
          {
            id: 1,
            content: "Test comment",
            createdAt: new Date(),
            author: {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              user: { profileImage: "profile.jpg" },
            },
          },
        ],
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockPostWithInteractions], 1]),
      };

      (mockPostRepository.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await postService.findAllWithInteractions(1, 10);

      expect(result).toEqual({
        posts: [
          {
            id: 1,
            content: "Test post content",
            media: undefined,
            publishDate: expect.any(Date),
            author: {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              profileImage: "profile.jpg",
            },
            comments: [
              {
                id: 1,
                content: "Test comment",
                createdAt: expect.any(Date),
                author: {
                  id: 1,
                  firstName: "John",
                  lastName: "Doe",
                  profileImage: "profile.jpg",
                },
                likes: [],
                reactions: [],
              },
            ],
            likes: [
              { id: 1, employeeId: 1, isLike: true },
              { id: 2, employeeId: 2, isLike: false },
            ],
            reactions: [
              { id: 1, employeeId: 1, emoji: "👍" },
              { id: 2, employeeId: 2, emoji: "👍" },
              { id: 3, employeeId: 3, emoji: "❤️" },
            ],
            stats: {
              totalComments: 1,
              totalLikes: 1,
              totalDislikes: 1,
              reactionCounts: {
                "👍": 2,
                "❤️": 1,
              },
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });
});
