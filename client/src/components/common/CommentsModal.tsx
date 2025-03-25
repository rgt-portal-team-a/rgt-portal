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
      // height: "100%",
      customPaging: () => (
        <div className="w-[10px] h-[10px] bg-white rounded-full transition-all absolute -top-7 duration-300 ease-in-out hover:bg-gray-400"></div>
      ),
    };

    return (
      <Slider
        {...settings}
        className="hidden h-full sm:block rounded-[30px] w-full overflow-clip  lg:w-full"
      >
        {images.map((item, index) => (
          <div key={index} className="h-full w-full bg-slate-200">
            <Media url={item} className="h-[444px] hidden sm:block" />
          </div>
        ))}
      </Slider>
    );
  };

  console.log("comments:", comments);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex justify-center items-center py-15"
      style={{ zIndex: "100" }}
    >
      <div className="bg-white rounded-[30px] p-4 relative flex justify-center gap-3 h-[444px] w-[90%] md:w-[80%] lg:w-[1027px] border-2 border-gray-200 ">
        <div className="w-1/2 hidden sm:flex h-full ">{renderMedia()}</div>
        <div className="h-full flex flex-col justify-between sm:w-1/2 space-y-1 ">
          <div className="flex w-full justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontalIcon className="" />
            </button>
          </div>

          <div className="flexx   flex-col justify-between">
            <div
              className="space-y-4  py-2 border-b h-[250px] overflow-y-scroll"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <Comments key={index} comment={comment} postId={postId} />
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
              <div className="flex items-end">
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
