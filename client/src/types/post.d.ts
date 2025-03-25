interface CreatePostDto {
  media?: string[];
  content: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface IPost {
  id: number;
  media?: string[];
  content: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  publishDate: Date;
  reactions?: string[];
  stats?: { totalComments: number; totalLikes: number; totalDislikes: 0 };
  comments: IComment[];
  likes: {
    id: number;
    employeeId: number;
    isLike: boolean;
  }[];
  // reactionCounts:
}

interface IComment {
  id?: number;
  content: string;
  createdAt: Date;
  author: {
    id: id;
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  // likes: (comment as any).likes || [],
  // reactions: (comment as any).reactions || [],
}

interface IStats {
  commentsCount: number;
  likesCount: number;
  disLikesCount: number;
  comments:IComment[]
  // reactionsByEmoji: object;
}
