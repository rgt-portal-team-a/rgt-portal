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
}

interface CommentLike {
  commentId: number;
  replyId: number;
  employeeId: number;
  createdAt: Date;
}

interface IComment {
  id?: number;
  commentId?: number;
  content: string;
  createdAt: Date;
  author: {
    id: id;
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  // isLiked?: boolean;
  likes?: CommentLike[];
  // onLike?: (val: number) => void;
  isCommentLoading?: boolean;
  commentReplies?: IComment[];
}

interface IStats {
  commentsCount: number;
  likesCount: number;
  disLikesCount: number;
  comments: IComment[];
}
