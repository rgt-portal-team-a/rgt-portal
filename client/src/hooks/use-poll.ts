import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Poll } from "@/types/polls";
import { PollService } from "@/api/services/poll.service";
import toastService from "@/api/services/toast.service";

export const usePoll = (pollId?: number) => {
  const queryClient = useQueryClient();

  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: () =>
      PollService.getPolls().then((res) => {
        console.log("polls:", res.data);
        return res.data as Poll[];
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => {
      return previousData;
    },
  });

  const { data: poll, isLoading } = useQuery<Poll>({
    queryKey: ["poll", pollId],
    queryFn: () =>
      PollService.getPollById(pollId as number).then((res) => res.data as Poll),
  });

  const deletePollMutation = useMutation({
    mutationFn: (pollId: number) => PollService.deletePoll(pollId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toastService.success("Poll deleted successfully!");
    },
    onError: () => {
      toastService.error("Failed to delete poll");
    },
  });

  const updatePollData = (newData: Partial<Poll>) => {
    queryClient.setQueryData<Poll>(["poll", pollId], (old) => {
      if (!old) return;
      return { ...old, ...newData };
    });
  };

  const voteMutation = useMutation({
    mutationFn: (optionId: number) =>
      PollService.votePoll(pollId as number, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });

      const previousPoll = queryClient.getQueryData<Poll>(["poll", pollId]);
      if (!previousPoll) return;

      const isSingleChoice = previousPoll.type === "single_choice";
      const selectedOption = previousPoll.options.find(
        (o) => o.id === optionId
      );
      const existingVote = previousPoll.options.find((o) => o.hasVoted);
      const wasAlreadyVoted = selectedOption?.hasVoted;

      // Calculate new totals and vote counts
      let newTotal = previousPoll.voteCount;
      const updatedOptions = previousPoll.options.map((option) => {
        // Handle single-choice vote transfer
        if (isSingleChoice && existingVote?.id === option.id) {
          newTotal = previousPoll.voteCount; // Total remains same for vote transfer
          return {
            ...option,
            voteCount: option.voteCount - 1,
            hasVoted: false,
            percentage: ((option.voteCount - 1) / newTotal) * 100,
          };
        }

        // Handle selected option
        if (option.id === optionId) {
          const voteDelta = wasAlreadyVoted ? -1 : 1;
          const newVoteCount = option.voteCount + voteDelta;

          // Update total for multiple choice
          if (!isSingleChoice) newTotal += voteDelta;

          return {
            ...option,
            voteCount: newVoteCount,
            hasVoted: !wasAlreadyVoted,
            percentage: newTotal > 0 ? (newVoteCount / newTotal) * 100 : 0,
          };
        }

        // For single-choice, maintain other options' counts but update percentages
        return {
          ...option,
          percentage: newTotal > 0 ? (option.voteCount / newTotal) * 100 : 0,
        };
      });

      const newPoll = {
        ...previousPoll,
        voteCount: newTotal,
        options: updatedOptions,
        hasVoted: isSingleChoice ? true : previousPoll.hasVoted,
      };

      updatePollData(newPoll);
      return { previousPoll };
    },
    onError: (_err, _optionId, context) => {
      if (context?.previousPoll) {
        updatePollData(context.previousPoll);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: (optionId: number) =>
      PollService.removeVote(pollId as number, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });

      const previousPoll = queryClient.getQueryData<Poll>(["poll", pollId]);
      if (!previousPoll) return;

      const isSingleChoice = previousPoll.type === "single_choice";
      const newTotal = Math.max(previousPoll.voteCount - 1, 0);

      const updatedOptions = previousPoll.options.map((option) => {
        if (option.id === optionId) {
          return {
            ...option,
            voteCount: option.voteCount - 1,
            hasVoted: false,
            percentage:
              newTotal > 0 ? ((option.voteCount - 1) / newTotal) * 100 : 0,
          };
        }

        // For single-choice, update all percentages after vote removal
        return {
          ...option,
          percentage: newTotal > 0 ? (option.voteCount / newTotal) * 100 : 0,
        };
      });

      const newPoll = {
        ...previousPoll,
        voteCount: newTotal,
        options: updatedOptions,
        hasVoted: isSingleChoice ? false : previousPoll.hasVoted,
      };

      updatePollData(newPoll);
      return { previousPoll };
    },
    onError: (_err, _optionId, context) => {
      if (context?.previousPoll) {
        updatePollData(context.previousPoll);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: ({
      pollId,
      pollData,
    }: {
      pollId: number;
      pollData: Partial<Poll>;
    }) => PollService.updatePoll(pollId, pollData),
    onMutate: async ({ pollId, pollData }) => {
      await queryClient.cancelQueries({ queryKey: ["poll", pollId] });

      const previousPoll = queryClient.getQueryData<Poll>(["poll", pollId]);
      if (!previousPoll) return;

      // Optimistically update the poll
      const updatedPoll = { ...previousPoll, ...pollData };
      queryClient.setQueryData(["poll", pollId], updatedPoll);

      return { previousPoll };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toastService.success("Poll updated successfully!");
    },
    onError: (error, variables, context) => {
      console.error("Update error:", error);
      if (context?.previousPoll) {
        queryClient.setQueryData(
          ["poll", variables.pollId],
          context.previousPoll
        );
      }
      toastService.error("Failed to update poll");
    },
  });

  const updatePoll = async (pollId: number, pollData: Partial<Poll>) => {
    await updatePollMutation.mutateAsync({ pollId, pollData });
  };

  const handleVote = (optionId: number) => {
    if (!poll) return;

    const hasVotedOnOption = poll.options.find(
      (o) => o.id === optionId
    )?.hasVoted;
    if (hasVotedOnOption) {
      removeVoteMutation.mutate(optionId);
    } else {
      voteMutation.mutate(optionId);
    }
  };

  const deletePoll = async (pollId: number) => {
    await deletePollMutation.mutateAsync(pollId);
  };

  return {
    polls,
    pollsLoading,
    poll,
    isLoading,
    handleVote,
    isVoting: voteMutation.isPending || removeVoteMutation.isPending,
    deletePoll,
    isPollDeleting: deletePollMutation.isPending,
    updatePoll,
    isPollUpdating: updatePollMutation.isPending,
  };
};
