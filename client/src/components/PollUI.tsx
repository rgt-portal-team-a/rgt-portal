import { usePoll } from "@/hooks/use-poll";
import AvtrBlock from "./AvtrBlock";
import PostSkeleton from "./common/PostSkeleton";
import WithRole from "@/common/WithRole";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { MoreVertical, Plus } from "lucide-react";
import { useRef, useState } from "react";
import DeleteIcon2 from "@/assets/icons/DeleteIcon2";
import ConfirmCancelModal from "./common/ConfirmCancelModal";
import DeleteRippleIcon from "./common/DeleteRippleIcon";
import EditIcon from "@/assets/icons/EditIcon";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import DatePicker from "./common/DatePicker";
import { Poll } from "@/types/polls";
import toastService from "@/api/services/toast.service";

const PollUI = ({ pollId }: { pollId: number }) => {
  const {
    poll,
    isLoading,
    handleVote,
    isVoting,
    deletePoll,
    isPollDeleting,
    updatePoll,
    isPollUpdating,
  } = usePoll(pollId);
  const { currentUser } = useAuthContextProvider();
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

 const [editingPoll, setEditingPoll] = useState<Partial<Poll>>(
   poll
     ? {
         description: poll.description ?? "",
         options: poll.options.map((opt) => ({
           id: opt.id,
           text: opt.text,
           pollId: opt.pollId,
           voteCount: opt.voteCount,
           percentage: opt.percentage,
         })),
         isAnonymous: poll.isAnonymous,
         allowComments: poll.allowComments,
         createdAt: new Date(poll.createdAt),
         endDate: poll.endDate ? new Date(poll.endDate) : undefined,
         status: poll.status
       }
     : {
         description: "",
         options: [],
         isAnonymous: false,
         allowComments: false,
         createdAt: new Date(),
         endDate: undefined,
       }
 );

  console.log("poll:", poll)

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(editingPoll.options || [])];
    newOptions[index].text = value;
    setEditingPoll({ ...editingPoll, options: newOptions });
  };

  const addNewOption = () => {
    setEditingPoll({
      ...editingPoll,
      options: [
        ...(editingPoll.options || []),
        { id: 0, text: "", pollId: pollId, voteCount: 0, percentage: 0 },
      ],
    });
  };

  const removeOption = (index: number) => {
    if ((editingPoll.options?.length ?? 0) <= 1) return; // Must keep at least one option
    const newOptions = [...(editingPoll.options || [])];
    newOptions.splice(index, 1);
    setEditingPoll({ ...editingPoll, options: newOptions });
  };

  if (isLoading) return <PostSkeleton />;
  if (!poll) return <div>Poll not found</div>;

  const onVote = (id: number) => {
    if (isVoting) return;
    handleVote(id);
  };
  const highestVoteCount = Math.max(...poll.options.map((o) => o.voteCount));

  const handleDelete = async (id: number) => {
    await deletePoll(id);
    setShowDeleteModal(false);
  };

  const handleUpdatePoll = async () => {
    // Validate inputs
    if (!editingPoll.description?.trim()) {
      toastService.error("Poll question cannot be empty");
      return;
    }

    if ((editingPoll.options?.length ?? 0) < 2) {
      toastService.error("Poll must have at least 2 options");
      return;
    }

    if (editingPoll.options?.some((opt) => !opt.text.trim())) {
      toastService.error("All options must have text");
      return;
    }

    try {
      await updatePoll(poll.id, {
        description: editingPoll.description,
        options: editingPoll.options,
        isAnonymous: editingPoll.isAnonymous,
        allowComments: editingPoll.allowComments,
        createdAt: editingPoll.createdAt,
        endDate: editingPoll.endDate,
        status : editingPoll.status
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="flex flex-col p-4 rounded-lg shadow-md w-full">
      <section className="w-full border-b py-3 flex justify-between relative">
        <AvtrBlock
          firstName={poll.createdBy.firstName}
          lastName={poll.createdBy.lastName}
          profileImage={poll.createdBy.user.profileImage}
        />

        <WithRole
          roles={["hr", "marketer"]}
          userRole={currentUser?.role?.name as string}
        >
          {Number(poll.createdBy?.id) === Number(currentUser?.id) && (
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

      {/* Deleting post modal */}
      <ConfirmCancelModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onSubmit={() => handleDelete(poll.id)}
        isSubmitting={isPollDeleting}
        submitText="Confirm"
        onOpenChange={() => console.log("")}
      >
        <div className="flex flex-col justify-center items-center space-y-2">
          <DeleteRippleIcon />
          <p className="text-lg font-semibold">Delete Poll?</p>
          <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
            Are you sure you want to delete this poll? This action cannot be
            undone.
          </p>
        </div>
      </ConfirmCancelModal>

      {/* Editing Post modal */}
      <ConfirmCancelModal
        title="Edit Poll"
        isOpen={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onSubmit={handleUpdatePoll}
        isSubmitting={isPollUpdating}
        submitText="Save Changes"
        onOpenChange={() => setShowEditModal(false)}
        closeOnClickOutside
      >
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <label className="font-semibold text-sm">Question</label>
            <Input
              placeholder="Edit poll question..."
              className="shadow-none w-full border-1 border-rgtpink"
              value={editingPoll.description || ""}
              onChange={(e) =>
                setEditingPoll({ ...editingPoll, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm">Options</p>
            <div className="space-y-4">
              {(editingPoll.options ?? []).map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    className="border-1 border-rgtpurple focus:border-rgtpink w-full"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {(editingPoll.options?.length ?? 0) > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Button
            variant={"ghost"}
            className="text-rgtpurple font-semibold cursor-pointer"
            onClick={addNewOption}
          >
            <Plus size={16} className="mr-1" /> Add Option
          </Button>
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-slate-500 font-semibold text-sm">
                Is poll anonymous
              </p>
              <div className="flex gap-2 text-sm">
                <label className="gap-1 flex">
                  Yes
                  <input
                    type="radio"
                    value="yes"
                    name="isAnonymous"
                    checked={poll.isAnonymous === true}
                    onChange={() => console.log("Set anonymous: true")}
                  />
                </label>
                <label className="gap-1 flex">
                  No
                  <input
                    type="radio"
                    value="no"
                    name="isAnonymous"
                    checked={poll.isAnonymous === false}
                    onChange={() => console.log("Set anonymous: false")}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-slate-500 font-semibold text-sm">
                Allow comments
              </p>
              <div className="flex gap-2 text-sm">
                <label className="gap-1 flex">
                  Yes
                  <input
                    type="radio"
                    value="yes"
                    name="allowComments"
                    checked={poll.allowComments === true}
                    onChange={() => console.log("Allow comments: true")}
                  />
                </label>
                <label className="gap-1 flex">
                  No
                  <input
                    type="radio"
                    value="no"
                    name="allowComments"
                    checked={poll.allowComments === false}
                    onChange={() => console.log("Allow comments: false")}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 font-semibold pb-1">
                From
              </label>
              <DatePicker
                className=""
                value={poll.createdAt}
                onChange={() => console.log("Edit start date")}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 font-semibold pb-1">
                To
              </label>
              <DatePicker
                className=""
                value={poll.endDate}
                onChange={() => console.log("Edit end date")}
              />
            </div>
          </div>
        </div>
      </ConfirmCancelModal>

      <section className="pt-3 space-y-3">
        <p className="text-sm">{poll?.description}</p>
        <div className="border p-2 rounded-lg border-slate-200 space-y-2">
          {poll.options.map((option) => {
            const isHighestVoted =
              option.voteCount > 0 &&
              option.voteCount === highestVoteCount &&
              poll.options.filter((o) => o.voteCount === highestVoteCount)
                .length === 1;

            return (
              <div
                key={option.id}
                onClick={() => onVote(option.id)}
                className={`flex items-center justify-between gap-4 relative ${
                  !poll.hasVoted
                    ? "cursor-pointer hover:bg-gray-50"
                    : "cursor-default"
                }`}
              >
                {/* Progress bar background */}
                <div
                  style={{ width: `${option.percentage}%` }}
                  className={`absolute transition-all duration-300 ease-in h-full rounded-md ${
                    option.voteCount === poll.voteCount
                      ? "bg-purpleaccent2"
                      : "bg-[#E2E8F0]"
                  }`}
                />

                {/* Option content */}
                <div className="flex items-center gap-1 w-full relative z-10 p-2">
                  <p className="text-sm text-nowrap">
                    <span className="font-semibold">
                      {option.percentage.toFixed(1)}%
                    </span>{" "}
                    {option.text}
                  </p>

                  {/* Highest Voted Indicator */}
                  {isHighestVoted && (
                    <img
                      src="/CheckCircle.svg"
                      alt="Most voted"
                      className="ml-2 w-4 h-4 text-pink-500"
                      style={{
                        filter:
                          "invert(39%) sepia(72%) saturate(747%) hue-rotate(310deg) brightness(96%) contrast(95%)",
                      }}
                    />
                  )}
                </div>

                <p className="text-[#94A3B8] text-sm relative z-10 pr-2">
                  {option.voteCount.toLocaleString()}
                </p>
              </div>
            );
          })}

          <div className="pt-3">
            <p className="text-rgtgray text-[12px]">
              {poll.voteCount.toLocaleString()} votes total •
              {poll.participationRate.toFixed(1)}% participation
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PollUI;
