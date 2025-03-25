import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Poll } from "@/types/polls";
import { PollService } from "@/api/services/poll.service";

export const usePoll = (pollId: number) => {
  const queryClient = useQueryClient();

  const { data: poll, isLoading } = useQuery<Poll>({
    queryKey: ["poll", pollId],
    queryFn: () =>
      PollService.getPollById(pollId).then((res) => res.data as Poll),
  });

  const updatePollData = (newData: Partial<Poll>) => {
    queryClient.setQueryData<Poll>(["poll", pollId], (old) => {
      if (!old) return;
      return { ...old, ...newData };
    });
  };

 const voteMutation = useMutation({
   mutationFn: (optionId: number) => PollService.votePoll(pollId, optionId),
   onMutate: async (optionId) => {
     await queryClient.cancelQueries({ queryKey: ["poll", pollId] });

     const previousPoll = queryClient.getQueryData<Poll>(["poll", pollId]);
     if (!previousPoll) return;

     const isSingleChoice = previousPoll.type === "single_choice";
     const selectedOption = previousPoll.options.find((o) => o.id === optionId);
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
   mutationFn: (optionId: number) => PollService.removeVote(pollId, optionId),
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

  return {
    poll,
    isLoading,
    handleVote,
    isVoting: voteMutation.isPending || removeVoteMutation.isPending,
  };
};
