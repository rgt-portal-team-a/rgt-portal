import { PostInteractionService } from "@/api/services/post-interaction.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useInteraction = (postId: number | undefined) => {
  const queryClient = useQueryClient();

  if (postId === undefined) {
    throw new Error("postId is undefined");
  }

  const { data: stats, refetch: refetchStats, isLoading } = useQuery({
    queryKey: ["postStats", postId],
    queryFn: () => PostInteractionService.getStats(postId),
  });

  const commentMutation = useMutation({
    mutationFn: (newComment: IComment) =>
      PostInteractionService.commentOnPost(postId, newComment.content),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postStats", postId] });
      const previousStats = queryClient.getQueryData<IStats>([
        "postStats",
        postId,
      ]);
      // Optimistically update the comment count
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
    mutationFn: (liked: boolean) => PostInteractionService.likePost(postId, liked),
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

  const addComment = (newComment: IComment) => {
    commentMutation.mutate(newComment);
  };

  const toggleLike = (liked: boolean) => {
    likeToggleMutation.mutate(liked);
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
    isLoading
  };
};
