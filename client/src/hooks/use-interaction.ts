import { PostInteractionService } from "@/api/services/post-interaction.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthContextProvider } from "./useAuthContextProvider";
import toastService from "@/api/services/toast.service";

export const useInteraction = (
  postId?: number,
  commentId?: number,
  replyId?: number
) => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthContextProvider();

  const {
    data: stats,
    refetch: refetchStats,
    isLoading,
  } = useQuery({
    queryKey: ["postStats", postId],
    queryFn: async () => {
      try {
        const data = await PostInteractionService.getStats(postId ?? 0);
        // toastService.success("Post stats fetched successfully");
        return data;
      } catch (error) {
        // toastService.error("Failed to fetch post stats");
        console.error("Failed to fetch post stats", error);
        throw error;
      }
    },
    enabled: !!postId,
  });

  const {
    data: commentsReplies,
    refetch: refetchCommentsReplies,
    isLoading: isCommentsRepliesLoading,
  } = useQuery({
    queryKey: ["commentReplies", commentId],
    queryFn: async () => {
      try {
        const data = await PostInteractionService.fetchCommentReplies(commentId ?? 0);
        // toastService.success("Comment replies fetched successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to fetch comment replies");
        throw error;
      }
    },
  });

  const {
    data: replyReplies,
    refetch: refetchReplyReplies,
    isLoading: isReplyRepliesLoading,
  } = useQuery({
    queryKey: ["replyReplies", replyId],
    queryFn: async () => {
      try {
        const data = await PostInteractionService.fetchReplyReplies(replyId ?? 0);
        // toastService.success("Reply replies fetched successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to fetch comment replies");
        throw error;
      }
    },
    enabled: !!replyId,
  });

  const commentMutation = useMutation({
    mutationFn: async (newComment: IComment) => {
      try {
        const data = await PostInteractionService.commentOnPost(postId, newComment.content);
        toastService.success("Comment added successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to add comment");
        throw error;
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postStats", postId] });
      const previousStats = queryClient.getQueryData<IStats>([
        "postStats",
        postId,
      ]);
      queryClient.setQueryData(
        ["postStats", postId],
        (old: IStats | undefined) => ({
          ...(old || {
            commentsCount: 0,
            likesCount: 0,
            disLikesCount: 0,
            comments: [],
          }),
          commentsCount: (old?.commentsCount || 0) + 1,
        })
      );
      return { previousStats };
    },
    onError: (_err, _newComment, context) => {
      queryClient.setQueryData(["postStats", postId], context?.previousStats);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats", postId] });
    },
  });

  const likeToggleMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      try {
        const data = await PostInteractionService.likePost(postId, liked);
        // toastService.success(liked ? "Post liked successfully" : "Post unliked successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to toggle like on post");
        throw error;
      }
    },
    onMutate: async (liked: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["postStats", postId] });
      const previousStats = queryClient.getQueryData<IStats>([
        "postStats",
        postId,
      ]);
      queryClient.setQueryData(
        ["postStats", postId],
        (old: IStats | undefined) => ({
          ...(old || {
            commentsCount: 0,
            likesCount: 0,
            disLikesCount: 0,
            comments: [],
          }),
          likesCount: (old?.likesCount || 0) + (liked ? 1 : -1),
        })
      );
      return { previousStats };
    },
    onError: (_err, _newLike, context) => {
      queryClient.setQueryData(["postStats", postId], context?.previousStats);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats", postId] });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      try {
        const data = await PostInteractionService.likeComment(commentId);
        // toastService.success("Comment liked successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to like comment");
        throw error;
      }
    },
    onMutate: async (commentId: number) => {
      await queryClient.cancelQueries({ queryKey: ["postStats", postId] });
      const previousStats = queryClient.getQueryData<IStats>([
        "postStats",
        postId,
      ]);
      queryClient.setQueryData(
        ["postStats", postId],
        (old: IStats | undefined) => {
          const currentStats = old || {
            commentsCount: 0,
            likesCount: 0,
            disLikesCount: 0,
            comments: [],
          };
          const updatedComments = currentStats.comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: (comment.likes ?? []).some(
                    (like) => like.employeeId === currentUser?.id
                  )
                    ? (comment.likes ?? []).filter(
                        (like) => like.employeeId !== currentUser?.id
                      )
                    : [
                        ...(comment.likes ?? []),
                        {
                          employeeId: currentUser?.id,
                          isLike: true,
                        },
                      ],
                }
              : comment
          );
          return {
            ...currentStats,
            comments: updatedComments,
          };
        }
      );
      return { previousStats };
    },
    onError: (_err, _commentId, context) => {
      queryClient.setQueryData(["postStats", postId], context?.previousStats);
      toastService.error("Failed to like comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["postStats", postId] });
    },
  });

  const replyToCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
      parentReplyId?: number;
    }) => {
      try {
        const data = await PostInteractionService.replyToComment(commentId, content);
        // toastService.success("Reply to comment successful");
        return data;
      } catch (error) {
        toastService.error("Failed to reply to comment");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["commentReplies", commentId],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["commentReplies", commentId],
      });
    },
  });

  const replyToReplyMutation = useMutation({
    mutationFn: async ({
      replyId,
      content,
      parentReplyId,
    }: {
      replyId: number;
      content: string;
      parentReplyId?: number;
    }) => {
      try {
        const data = await PostInteractionService.replyToReply(replyId, content, parentReplyId);
        // toastService.success("Reply added successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to add reply");
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "replyReplies",
          variables.parentReplyId || variables.replyId,
        ],
      });
    },
    onError: (error) => {
      toastService.error(error.message);
    },
  });

  const likeReplyMutation = useMutation({
    mutationFn: async (replyId: number) => {
      try {
        const data = await PostInteractionService.likeReply(replyId);
        // toastService.success("Reply liked successfully");
        return data;
      } catch (error) {
        toastService.error("Failed to like reply");
        throw error;
      }
    },
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ["replyReplies", replyId] });
      const previousStats = queryClient.getQueryData<IComment>([
        "replyReplies",
        replyId,
      ]);
      queryClient.setQueryData(
        ["replyReplies", replyId],
        (old: IComment[] | undefined) => {
          if (!old) return old;
          return old.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  likes: (reply.likes ?? []).some(
                    (like) => like.employeeId === currentUser?.employee.id
                  )
                    ? (reply.likes ?? []).filter(
                        (like) => like.employeeId !== currentUser?.employee.id
                      )
                    : [
                        ...(reply.likes ?? []),
                        {
                          employeeId: currentUser?.employee.id,
                          isLike: true,
                        },
                      ],
                }
              : reply
          );
        }
      );
      return { previousStats };
    },
    onError: (_err, _replyId, context) => {
      queryClient.setQueryData(
        ["replyReplies", replyId],
        context?.previousStats
      );
    },
    onSettled: (_, __, replyId) => {
      queryClient.invalidateQueries({
        queryKey: ["replyReplies", replyId],
      });
    },
  });

  const replyToReply = async (
    replyId: number,
    content: string,
    parentReplyId?: number
  ) => {
    await replyToReplyMutation.mutateAsync({
      replyId,
      content,
      parentReplyId,
    });
  };

  const toggleReplyLike = (replyId: number | undefined) => {
    if (!replyId) return;
    likeReplyMutation.mutate(replyId);
  };

  const addComment = (newComment: IComment) => {
    commentMutation.mutate(newComment);
  };

  const toggleLike = (liked: boolean) => {
    likeToggleMutation.mutate(liked);
  };

  const toggleCommentLike = (commentId: number | undefined) => {
    if (!commentId) return;
    likeCommentMutation.mutate(commentId);
  };

  const replyComment = async (
    commentId: number,
    content: string,
    parentReplyId?: number
  ) => {
    replyToCommentMutation.mutateAsync({ commentId, content, parentReplyId });
  };

  return {
    stats: stats || {
      commentsCount: 0,
      likesCount: 0,
      disLikesCount: 0,
      comments: [],
    },
    addComment,
    isCommentLoading: commentMutation.isPending,
    toggleLike,
    refetchStats,
    isLoading,
    toggleCommentLike,
    replyComment,
    isCommentReplyLoading: replyToCommentMutation.isPending,
    commentsReplies,
    refetchCommentsReplies,
    isCommentsRepliesLoading,
    replyToReply,
    toggleReplyLike,
    isReplyReplyLoading: replyToReplyMutation.isPending,
    replyReplies,
    refetchReplyReplies,
    isReplyRepliesLoading,
  };
};
