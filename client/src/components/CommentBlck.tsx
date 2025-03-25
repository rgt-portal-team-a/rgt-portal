import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { useInteraction } from "@/hooks/use-interaction";
import { User } from "@/types/authUser";
import SendIcon from "@/assets/icons/SendIcon";
import { Loader } from "lucide-react";

const CommentBlck: React.FC<{
  user: User | null;
  postId: number | undefined;
}> = ({ user, postId }) => {
  const [comment, setComment] = useState<IComment>({
    content: "",
    author: {
      id: user?.employee?.id,
      firstName: user?.employee?.firstName ?? "",
      lastName: user?.employee?.lastName ?? "",
      profileImage: user?.profileImage ?? "",
    },
    createdAt: new Date(),
  });

  const { addComment, isCommentLoading } = useInteraction(postId);

  const handleSubmitComment = async () => {
    try {
      if (!comment.content) {
        return;
      }
      addComment(comment);
      setComment({ ...comment, content: "" });
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  if (!user) return;

  return (
    <section className="border-t flex items-center space-x-2 w-full pt-4">
      <Avatar>
        <AvatarImage
          src={user.profileImage}
          alt={user.employee.firstName ?? ""}
        />
        <AvatarFallback>{user.employee.firstName}</AvatarFallback>
      </Avatar>
      <Input
        className="w-full border-0 shadow-none bg-[#F6F6F9] py-4 rounded-lg"
        placeholder="Wanna say something?"
        onChange={(e) => setComment({ ...comment, content: e.target.value })}
        value={comment.content}
        disabled={isCommentLoading}
      />

      <div className="flex justify-center space-x-">
        {isCommentLoading ? (
          <Loader className="animate-spin" size={24} color="#EA5E9C" />
        ) : (
          <div onClick={handleSubmitComment}>
            <SendIcon className=" w-8 h-7 cursor-pointer  fill-[#EA5E9C]" />
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentBlck;
