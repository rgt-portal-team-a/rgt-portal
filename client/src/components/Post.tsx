import { useInteraction } from "@/hooks/use-interaction";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { IFeed } from "@/types/employee";
import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Media from "./Media";
import PostSkeleton from "./common/PostSkeleton";
import AvtrBlock from "./AvtrBlock";
import FeedActions from "./feedActions";
import { MoreVertical } from "lucide-react";
import CommentsModal from "./common/CommentsModal";
import { SampleNextArrow, SamplePrevArrow } from "./Feed/PaginationArrows";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import WithRole from "@/common/WithRole";
import EditIcon from "@/assets/icons/EditIcon";
import DeleteIcon2 from "@/assets/icons/DeleteIcon2";
import ConfirmCancelModal from "./common/ConfirmCancelModal";
import DeleteRippleIcon from "./common/DeleteRippleIcon";
import { usePost } from "@/hooks/use-posts";
import { EditPost } from "./EditPost";

const Post: React.FC<IFeed> = ({ post }) => {
  const { currentUser } = useAuthContextProvider();
  const { stats, isLoading } = useInteraction(post?.id);

  const [isComments, setIsComments] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { deletePost, isPostDeleting} = usePost();

  // clicking outside of update and delete post container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (!(event.target as Element)?.closest(".more-vertical-icon")) {
          setShowMore(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleDelete = async (id: number) => {
    await deletePost(id);
    setShowDeleteModal(false);
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
          <section className="w-full border-b py-3 flex justify-between relative">
            <AvtrBlock
              firstName={post.author?.firstName as string}
              lastName={post.author?.lastName as string}
              profileImage={post.author?.profileImage as string}
            />
            <WithRole
              roles={["hr", "marketer"]}
              userRole={currentUser.role.name}
            >
              {Number(post.author?.id) === Number(currentUser.id) && (
                <MoreVertical
                  className="more-vertical-icon text-[#CBD5E1] hover:text-[#8d949c] transition-colors duration-300 ease-in cursor-pointer"
                  onClick={() => setShowMore(!showMore)}
                />
              )}
            </WithRole>
            {showMore && (
              <div
                ref={menuRef}
                className="absolute -right-2 top-10 bg-white border rounded flex flex-col items-center transition-all duration-300 ease-in"
                style={{ zIndex: "30" }}
              >
                <p
                  className="flex border-b w-full items-center justify-center py-2 px-3 cursor-pointer hover:bg-slate-100 transition-all duration-300"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMore(false);
                  }}
                >
                  <EditIcon />
                </p>

                <p
                  className="flex w-full justify-center cursor-pointer hover:bg-slate-100 transition-all duration-300 py-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <DeleteIcon2 />
                </p>
              </div>
            )}
          </section>

          {/* Edit Modal */}
          {showEditModal && (
            <EditPost
              postId={post.id}
              initialContent={post.content}
              initialMedia={post.media || []}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => setShowEditModal(false)}
            />
          )}

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

          <ConfirmCancelModal
            isOpen={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onSubmit={() => handleDelete(post.id)}
            isSubmitting={isPostDeleting}
            submitText="Confirm"
            onOpenChange={() => console.log("")}
          >
            <div className="flex flex-col justify-center items-center space-y-2">
              <DeleteRippleIcon />
              <p className="text-lg font-semibold">Delete Post?</p>
              <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
            </div>
          </ConfirmCancelModal>

          {/* Render the CommentsModal */}
          <CommentsModal
            isOpen={isComments}
            onClose={() => setIsComments(false)}
            comments={stats.comments.reverse()}
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
          className="fixed inset-0 flex items-center bg-black/50 justify-center backdrop-blur-sm"
          onClick={closeMediaModal}
          style={{ zIndex: 1200 }}
        >
          <div className="relative items-center flex flex-col justify-center max-w-[80vw] sm:w-[550px] h-[540px]">
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
                className="w-full h-full rounded-md object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="w-full flex justify-center pt-4">
              <button
                className="text-lg font-semibold text-white cursor-pointer transition-colors duration-300 ease-in"
                onClick={closeMediaModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
