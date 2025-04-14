import LikeIcon from "@/assets/icons/LikeIcon";
import { formatDateToDaysAgo } from "@/lib/helpers";
import { useState } from "react";
import Avtr from "../Avtr";
import { useInteraction } from "@/hooks/use-interaction";
import { Loader } from "lucide-react";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";

const RecursiveComments = ({
  comment,
  parentReplyId,
  postId,
}: {
  comment: IComment | undefined;
  parentReplyId: number | undefined;
  postId: number;
}) => {
  const { currentUser } = useAuthContextProvider();
  const { replyToReply, toggleReplyLike, isReplyReplyLoading, replyReplies } =
    useInteraction(postId, comment?.commentId, comment?.id);

  const [reply, setReply] = useState(false);
  const [content, setContent] = useState("");
  const [viewReplies, setViewReplies] = useState(false);

  const handleReplyToReply = async () => {
    if (!content || !comment?.commentId) return;
    await replyToReply(comment.commentId, content, parentReplyId);
    setContent("");
    setReply(false);
  };

  // console.log("replyReplies:", replyReplies);
  // console.log("comment:", comment);

  const isLiked = comment?.likes?.find(
    (item) => item.employeeId === currentUser?.employee.id
  );

  return (
    <div className="flex items-start gap-2">
      <Avtr
        url={comment?.author.profileImage ?? ""}
        name={comment?.author.firstName ?? ""}
        avtBg="bg-purple-200 text-purple-500 text-xs"
        className="text-xs font-semibold text-white"
      />
      <div className="w-full flex items-center">
        <div className="flex flex-col items-center w-[90%] gap-1">
          <div className="w-full pb-[12px] space-y-1">
            <p className="text-sm text-[#1E293B] font-semibold text-wrap w-full line-clamp-3 truncate">
              {
                comment?.author.firstName
                // + comment?.author.lastName
              }
              <span className="text-[#706D8A] font-[400] text-sm pl-2">
                {comment?.content}
              </span>
            </p>

            <div className="flex w-full items-center font-semibold text-[12px] space-x-2 text-[#8A8A8C]">
              <p className="text-nowrap">
                {formatDateToDaysAgo(String(comment?.createdAt))}
              </p>
              <p className="text-nowrap">
                {comment?.likes?.length ?? 0}{" "}
                {comment?.likes && comment?.likes.length == 1
                  ? "like"
                  : "likes"}
              </p>
              <p
                className="text-rgtpurple cursor-pointer"
                onClick={() => setReply(!reply)}
              >
                Reply
              </p>
              <div className="" onClick={() => toggleReplyLike(comment?.id)}>
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
              <div className="flex sm:flex-row flex-col items-center gap-4 pt-2 w-64">
                <input
                  className="w-full border-b-1 shadow-none outline-0 text-sm font-medium text-slate-500"
                  placeholder="Wanna say something?"
                  onChange={(e) => setContent(e.target.value)}
                  value={content}
                />
                <div className="flex justify-end">
                  <button
                    className="text-sm font-semibold text-rgtpink cursor-pointer"
                    onClick={handleReplyToReply}
                  >
                    {isReplyReplyLoading ? (
                      <Loader className="animate-spin w-4 h-4" />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          {replyReplies && replyReplies.length > 0 && (
            <div className="flex flex-col w-full">
              <div
                className="flex items-center gap-2 text-[#8A8A8C] font-semibold text-[12px] cursor-pointer"
                onClick={() => setViewReplies(!viewReplies)}
              >
                <div className="w-[31px] border-t-[#8A8A8C] border-1" />
                <p>View replies ({replyReplies.length})</p>
              </div>

              {viewReplies && (
                <>
                  {replyReplies.map((item, index) => (
                    <div key={index} className="pt-3">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RecursiveComments;
