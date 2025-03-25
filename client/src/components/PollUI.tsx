import { usePoll } from "@/hooks/use-poll";
import AvtrBlock from "./AvtrBlock";
import PostSkeleton from "./common/PostSkeleton";

const PollUI = ({ pollId }: { pollId: number }) => {
  const { poll, isLoading, handleVote, isVoting } = usePoll(pollId);

  if (isLoading) return <PostSkeleton />;
  if (!poll) return <div>Poll not found</div>;

  const onVote = (id: number) => {
    if (isVoting) return;
    handleVote(id);
  };
  const highestVoteCount = Math.max(...poll.options.map((o) => o.voteCount));

  return (
    <div className="flex flex-col p-4 rounded-lg shadow-md w-full bg-white">
      <section className="w-full border-b py-3 flex justify-between">
        <AvtrBlock
          firstName={poll.createdBy.firstName}
          lastName={poll.createdBy.lastName}
          profileImage={poll.createdBy.user.profileImage}
        />
        {/* <MoreVertical className="text-[#CBD5E1] hover:text-[#8d949c] transition-colors duration-300 ease-in cursor-pointer" /> */}
      </section>
      <section className="pt-3 space-y-3">
        <p className="text-sm">{poll?.description}</p>
        <div className="border p-2 rounded-lg border-slate-200 space-y-2">
          {poll.options.map((option) => {
            const isUniqueHighest =
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
                }`}>
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

                  {/* highest Voted indicator */}
                  {(option.hasVoted || isUniqueHighest) && (
                    <img
                      src="/CheckCircle.svg"
                      alt={option.hasVoted ? "Your vote" : "Most voted"}
                      className="ml-2 w-4 h-4"
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
