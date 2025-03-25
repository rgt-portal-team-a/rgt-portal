import { PostService } from "@/api/services/posts.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

export const usePost = (postId: number) => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => PostService.getPosts().then((res) => res.data as IPost[]),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => PostService.deletPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      toast({
        title: "Success",
        description: "Post deleted successfully!",
        duration: 500,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error deleting post:${error}`,
        duration: 500,
        variant: "destructive",
      });
    },
  });

  const deletePost = async (id: number) => {
    await deletePostMutation.mutateAsync(id);
  };

  return{
    posts,
    deletePost,
    postsLoading,
    isPostDeleting:deletePostMutation.isPending
  }
};
