import LikeIcon from "@/assets/icons/LikeIcon";
import MessageIcon from "@/assets/icons/MessageIcon";
import { useInteraction } from "@/hooks/use-interaction";
import { useState } from "react";

const FeedActions = ({
  postId,
  userPrevLiked,
  onComments,
  showText = true,
}: {
  postId: number;
  userPrevLiked: boolean | undefined;
  onComments: (val: boolean) => void;
  showText?: boolean;
}) => {
  const [liked, setLiked] = useState(userPrevLiked || false);
  const [commented, setCommented] = useState(false);

  const { stats, toggleLike } = useInteraction(postId);


  const handleLike = () => {
    setLiked(!liked);
    toggleLike(!liked);
  };

  const showComments = () => {
    setCommented(!commented);
    onComments(!commented);
  };

  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-8">
        <div className="flex items-center">
          <div className="pr-1 cursor-pointer" onClick={handleLike}>
            <LikeIcon
              className={`text-[#94A3B8] ${
                liked ? "fill-rgtpink" : "fill-none"
              } 
              `}
              size={24}
              stroke={`${liked ? "" : "#94A3B8"}`}
            />
          </div>
          <p className="text-sm font-medium">
            {stats?.likesCount} {showText && "Likes"}
          </p>
        </div>

        <div className="flex items-center">
          <div className="pr-1 cursor-pointer" onClick={showComments}>
            <MessageIcon size={24} />
          </div>
          <p className="text-sm font-medium">
            {stats?.commentsCount} {showText && "Comments"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedActions;
