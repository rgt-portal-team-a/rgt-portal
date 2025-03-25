import React from "react";
import { MoreHorizontalIcon } from "lucide-react";
import Comments from "../Feed/Comments";
import FeedActions from "../feedActions";
import NoComments from "@/assets/icons/NoComments";
import CommentBlck from "../CommentBlck";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { SampleNextArrow, SamplePrevArrow } from "../Feed/PaginationArrows";
import Slider from "react-slick";
import Media from "../Media";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: IComment[];
  postId: number;
  userPrevLiked: boolean | undefined;
  onComments: (val: boolean) => void;
  images?: string[] | undefined;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  comments,
  postId,
  userPrevLiked,
  onComments,
  images,
}) => {
  const { currentUser } = useAuthContextProvider();

  const renderMedia = () => {
    if (!images || images.length === 0) return null;

    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      customPaging: () => (
        <div className="w-[10px] h-[10px] bg-white rounded-full transition-all absolute -top-7 duration-300 ease-in-out hover:bg-gray-400"></div>
      ),
    };

    return (
      <Slider
        {...settings}
        className="hidden sm:block h-full  rounded-[30px] w-full "
      >
        {images.map((item, index) => (
          <div key={index}>
            <Media url={item} className="h-[440px] hidden sm:block" />
          </div>
        ))}
      </Slider>
    );
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0  backdrop-blur-xs bg-opacity-50 bg-black/10 flex justify-center items-center py-15"
      style={{
        zIndex: "100",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div className="bg-white rounded-[30px] p-4 relative flex justify-center gap-3 h-[80%] w-[90%] md:w-[80%] lg:w-[1027px]">
        <div className="max-w-[300px] md:max-w-[500px] hidden sm:flex ">
          {renderMedia()}
        </div>
        <div className="h-full  flex-1 space-y-1">
          <div className="flex w-full justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontalIcon className="" />
            </button>
          </div>

          <div className="flex flex-col justify-between">
            <div
              className="space-y-4  py-2 border-b h-[250px] overflow-y-scroll"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <Comments key={index} {...comment} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <NoComments />
                </div>
              )}
            </div>

            <section className="">
              <FeedActions
                postId={postId}
                userPrevLiked={userPrevLiked}
                onComments={onComments}
                showText={false}
              />
              <div className="">
                <p className="text-sm font-medium">Liked by</p>
                <CommentBlck postId={postId} user={currentUser} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
