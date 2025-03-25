/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/posts`;

export class PostInteractionService {
  static async getStats(id: number): Promise<IStats> {
    try {
      const response = await axios.get(`${API_URL}/${id}/stats`);
      // console.log("responseStats:", response.data.data);
      if (!response.data.success) {
        throw new Error("Error fetching post stats");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error getting post stats", error);
      throw error;
    }
  }

  static async fetchCommentReplies(commentId: number): Promise<IComment[]> {
    try {
      const response = await axios.get(
        `${API_URL}/comments/${commentId}/replies`
      );
      console.log("response:", response.data);
      if (!response.data.success) {
        throw new Error("Failed to fetch replies for comments");
      }
      return response.data.data.reverse();
    } catch (error) {
      console.error("Error fetching comment rplies", error);
      throw error;
    }
  }

  static async likePost(
    postId: number | undefined,
    liked: boolean
  ): Promise<void> {
    try {
      if (!postId) return;
      const response = await axios.post(`${API_URL}/${postId}/likes`, {
        isLike: liked,
      });
      // console.log("responseLikes:", response.data);
      // return response.data;
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  }

  static async unlikePost(postId: number): Promise<void> {
    try {
      await axios.post(`${API_URL}/${postId}/unlike`);
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  }

  static async commentOnPost(
    postId: number | undefined,
    comment: string
  ): Promise<any> {
    try {
      if (!postId) {
        console.error("Post id is undefined.");
        throw new Error("Post id is undefined");
      }
      const response = await axios.post(`${API_URL}/${postId}/comments`, {
        content: comment,
      });
      return response.data;
    } catch (error) {
      console.error("Error commenting on post:", error);
      throw error;
    }
  }

  static async deleteComment(postId: number, commentId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${postId}/comment/${commentId}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  static async likeComment(commentId: number): Promise<any> {
    try {
      
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/likes`
      );
      return response.data;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  }

  static async likeReply(replyId: number): Promise<any> {
    try {
      console.log("replyId:", replyId);
      const response = await axios.post(`${API_URL}/replies/${replyId}/likes`);
      console.log("response Reply Like:", response.data)
      return response.data.data;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  }

  static async replyToComment(
    commentId: number,
    content: string
  ): Promise<{
    commentId: number;
    parentReplyId?: number;
    authorId: number;
    content: string;
    comment: { id: number };
    parentReply?: { id: number };
    author: { id: number };
  }> {
    try {
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/replies`,
        {
          content,
        }
      );
      // console.log("response Reply Comment:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  }

  static async replyToReply(
    commentId: number,
    content: string,
    parentReplyId?: number
  ): Promise<{
    commentId: number;
    parentReplyId?: number;
    authorId: number;
    content: string;
    comment: { id: number };
    parentReply?: { id: number };
    author: { id: number };
  }> {
    try {
      // console.log("...hiting reply func.");
      const response = await axios.post(
        `${API_URL}/comments/${commentId}/replies`,
        {
          content,
          parentReplyId,
        }
      );
      // console.log("response Reply Comment:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  }

  static async fetchReplyReplies(replyId: number): Promise<IComment[]> {
    try {
      const response = await axios.get(`${API_URL}/replies/${replyId}/replies`);
      // console.log("reply Replies:", response.data);

      if (!response.data.success) {
        throw new Error("Failed to fetch replies for comments");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching the replies of replies of comment", error);
      throw error;
    }
  }
}
