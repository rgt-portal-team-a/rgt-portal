/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostService } from "@/api/services/posts.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toastService from "@/api/services/toast.service";

export const usePost = () => {
  const queryClient = useQueryClient();
  

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => PostService.getPosts().then((res) => res.data as IPost[]),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => {
      return previousData;
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => PostService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toastService.success("Post deleted successfully!");
    },
    onError: (error) => {
      toastService.error(`Error deleting post:${error}`);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, postData }: { id: number; postData: IPost }) =>
      PostService.updatePost(id, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toastService.success("Post updated successfully!");
    },
    onError: (error) => {
      toastService.error(`Error updating post: ${error}`);
    },
  });

  const updatePost = async (id: number, postData: any) => {
    await updatePostMutation.mutateAsync({ id, postData });
  };

  const deletePost = async (id: number) => {
    await deletePostMutation.mutateAsync(id);
  };

  return {
    posts,
    deletePost,
    postsLoading,
    isPostDeleting: deletePostMutation.isPending,
    updatePost,
    isPostUpdating: updatePostMutation.isPending,
  };
};
