/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostService } from "@/api/services/posts.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

export const usePost = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => PostService.getPosts().then((res) => res.data as IPost[]),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => PostService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error deleting post:${error}`,
        variant: "destructive",
      });
    },
  });


   const updatePostMutation = useMutation({
     mutationFn: ({ id, postData }: { id: number; postData: IPost }) =>
       PostService.updatePost(id, postData),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["posts"] });
       toast({
         title: "Success",
         description: "Post updated successfully!",
       });
     },
     onError: (error) => {
       toast({
         title: "Error",
         description: `Error updating post: ${error}`,
         variant: "destructive",
       });
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
    isPostUpdating: updatePostMutation.isPending
  };
};
