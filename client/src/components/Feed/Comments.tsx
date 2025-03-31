import LikeIcon from "@/assets/icons/LikeIcon";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useState } from "react";
import { formatDateToDaysAgo } from "@/lib/helpers";
import { Loader } from "lucide-react";
import { useInteraction } from "@/hooks/use-interaction";
import RecursiveComments from "../common/RecursiveComments";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";

const Comments = ({
  comment,
  postId,
}: {
  comment: IComment;
  postId: number;
}) => {
  const {
    toggleCommentLike,
    replyComment,
    isCommentReplyLoading,
    commentsReplies,
  } = useInteraction(postId, comment.id);

  const { currentUser } = useAuthContextProvider();

  const [reply, setReply] = useState(false);
  const [content, setContent] = useState("");
  const [viewReplies, setViewReplies] = useState(false);

  const isLiked = comment.likes?.find(
    (item) => item.employeeId === currentUser?.employee.id
  );

  // console.log("commentReplies:", commentsReplies);

  const handleCommentReply = async () => {
    // console.log("comment.id, content:", comment.id, content);
    if (!content) return;
    if (comment.id) {
      await replyComment(comment.id, content);
      setContent("");
    }
  };

  const handleToggleReply = () => {
    setReply(!reply);
  };

  return (
    <div className="flex items-start gap-2">
      <Avatar>
        <AvatarImage
          src={comment.author.profileImage}
          alt={comment.author.firstName}
        />
      </Avatar>
      <div className="w-full flex items-center">
        <div className="flex flex-col items-center w-[90%] gap-1">
          <div className="w-full pb-[12px] space-y-1">
            <p className="text-sm text-[#1E293B] font-semibold text-wrap w-full line-clamp-3 truncate">
              {
                comment.author.firstName
                // + comment.author.lastName
              }
              <span className="text-[#706D8A] font-[400] text-sm">
                {comment.content}
              </span>
            </p>

            <div className="flex w-full items-center font-semibold text-[12px] space-x-2 text-[#8A8A8C]">
              <p>{formatDateToDaysAgo(String(comment.createdAt))}</p>
              <p>
                {comment.likes?.length}{" "}
                {comment.likes?.length === 1 ? "like" : "likes"}
              </p>
              <p
                className="text-rgtpurple cursor-pointer"
                onClick={handleToggleReply}
              >
                Reply
              </p>
              <div className="" onClick={() => toggleCommentLike(comment.id)}>
                <LikeIcon
                  size={15}
                  stroke={`${isLiked ? "" : "#6418C3"}`}
                  className={`cursor-pointer ${
                    isLiked ? "fill-[#6418C3]" : ""
                  }`}
                />
              </div>
            </div>
            {reply && (
              <div className="flex sm:flex-row flex-col items-center gap-4 pt-2">
                <input
                  className="w-full border-b-1 shadow-none outline-0 text-sm font-medium text-slate-500"
                  placeholder="Wanna say something?"
                  onChange={(e) => setContent(e.target.value)}
                  value={content}
                />
                <div className="flex justify-end">
                  <button
                    className="text-sm font-semibold text-rgtpink cursor-pointer"
                    onClick={handleCommentReply}
                  >
                    {isCommentReplyLoading ? (
                      <Loader className="animate-spin w-4 h-4" />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full">
            {isCommentReplyLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-[31px] h-4 bg-gray-300 animate-pulse rounded" />
                <div className="w-24 h-4 bg-gray-300 animate-pulse rounded" />
              </div>
            ) : (
              commentsReplies &&
              commentsReplies.length > 0 && (
                <div
                  className="flex items-center gap-2 text-[#8A8A8C] font-semibold text-[12px] cursor-pointer hover:text-black transition-all duration-300 ease-in"
                  onClick={() => setViewReplies(!viewReplies)}
                >
                  <div className="w-[31px] border-t-[#8A8A8C] border-1" />
                  <p>View replies ({commentsReplies?.length})</p>
                </div>
              )
            )}
            <div>
              {viewReplies && (
                <>
                  {commentsReplies?.map((item, index) => (
                    <div className="pt-3">
                      <RecursiveComments
                        comment={item}
                        parentReplyId={item.id}
                        key={index}
                        postId={postId}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
