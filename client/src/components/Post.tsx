import { useInteraction } from "@/hooks/use-interaction";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { IFeed } from "@/types/employee";
import { useState } from "react";
import Slider from "react-slick";
import Media from "./Media";
import PostSkeleton from "./common/PostSkeleton";
import AvtrBlock from "./AvtrBlock";
import FeedActions from "./feedActions";
import { MoreVertical, X } from "lucide-react";
import CommentsModal from "./common/CommentsModal";
import { SampleNextArrow, SamplePrevArrow } from "./Feed/PaginationArrows";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Post: React.FC<IFeed> = ({ post }) => {
  const { currentUser } = useAuthContextProvider();
  const { stats, isLoading } = useInteraction(post?.id);

  const [isComments, setIsComments] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  const handleIsComments = (val: boolean) => {
    setIsComments(val);
  };

  const openMediaModal = (url: string) => {
    setSelectedMediaUrl(url);
    setIsMediaModalOpen(true);
  };

  const closeMediaModal = () => {
    setSelectedMediaUrl(null);
    setIsMediaModalOpen(false);
  };

  const formatText = (text: string | undefined) => {
    if (!text) {
      return;
    }
    return text.split(" ").map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-rgtpink">
            {word}{" "}
          </span>
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  const renderMedia = () => {
    if (!post?.media || post?.media.length === 0) return null;

    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      customPaging: () => (
        <div className="group flex items-center justify-center w-fit rounded-full">
          <div className="w-[10px] absolute -top-7 h-[10px] group-[.slick-inactive]:bg-white rounded-full transition-all duration-300 ease-in-out hover:bg-gray-400 group-[.slick-active]:bg-[#6418C3]"></div>
        </div>
      ),
    };

    return (
      <div className="relative">
        <Slider {...settings}>
          {post.media.map((item, index) => (
            <div key={index}>
              <Media
                url={item}
                className="h-72"
                onClick={() => openMediaModal(item)}
              />
            </div>
          ))}
        </Slider>
      </div>
    );
  };

  if (isLoading) {
    return <PostSkeleton />;
  }

  return (
    <div className="flex flex-col p-4 rounded-lg shadow-md w-full bg-white">
      {post && currentUser && (
        <div>
          <section className="w-full border-b py-3 flex justify-between">
            <AvtrBlock
              firstName={post.author?.firstName as string}
              lastName={post.author?.lastName as string}
              profileImage={post.author?.profileImage as string}
            />
            <MoreVertical className="text-[#CBD5E1] hover:text-[#8d949c] transition-colors duration-300 ease-in cursor-pointer" />
          </section>

          <section className="pt-3 space-y-3">
            <p className="text-sm">{formatText(post?.content)}</p>
            <div className="">{renderMedia()}</div>
            <FeedActions
              postId={post.id}
              userPrevLiked={
                post.likes.find(
                  (item) => item.employeeId === currentUser.employee.id
                )?.isLike
              }
              onComments={handleIsComments}
            />
          </section>

          {/* Render the CommentsModal */}
          <CommentsModal
            isOpen={isComments}
            onClose={() => setIsComments(false)}
            comments={stats.comments}
            postId={post?.id}
            userPrevLiked={
              post?.likes.find(
                (item) => item.employeeId === currentUser?.employee.id
              )?.isLike
            }
            onComments={handleIsComments}
            images={post.media}
          />
        </div>
      )}

      {/* Render the Media Modal */}
      {isMediaModalOpen && selectedMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={closeMediaModal}
        >
          <div className="relative flex justify-center max-w-[80vw] sm:max-w-[50vw] sm:max-h-[70vh]">
            {selectedMediaUrl.endsWith(".mp4") ||
            selectedMediaUrl.endsWith(".mov") ||
            selectedMediaUrl.includes("video") ? (
              <video
                controls
                className="w-full h-auto rounded-md"
                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking video
              >
                <source src={selectedMediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={selectedMediaUrl}
                alt="Media"
                className="w-full h-auto rounded-md object-cover"
                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
              />
            )}
            <button
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors duration-300 ease-in"
              onClick={closeMediaModal}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
