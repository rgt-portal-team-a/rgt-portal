import LikeIcon from "@/assets/icons/LikeIcon";
import { Avatar, AvatarImage } from "../ui/avatar";

const Comments = (comment: IComment) => {
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

            <div className="flex w-full font-semibold text-[12px] space-x-2 text-[#8A8A8C]">
              <p>0d</p>
              <p>1 like</p>
              <p className="text-rgtpurple cursor-pointer">Reply</p>
            </div>
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 text-[#8A8A8C] font-semibold text-[12px]">
              <div className="w-[31px] border-t-[#8A8A8C] border-1" />
              <p>View replies (1)</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center h-full">
          <LikeIcon size={15} stroke="#6418C3" className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Comments;
