import { useMutation, useQuery, useQueries } from "@tanstack/react-query";
import { API } from "@/configs/api";
import { VoteProps } from "@/stores/PollStore";
import apiClient from "@/lib/api";
import { PollProps } from "@/types/poll";

const usePollController = () => {
  const { data: polls, refetch: refetchPolls } = useQuery<PollProps[]>({
    queryKey: [API.POLL],
    queryFn: () => {
      return apiClient.get(API.POLL).then((res) => res.data);
    },
    // enabled: !!user_id,
  });

  const useGetPoll = (pollId: number) => {
    return useQuery<PollProps>({
      queryKey: [API.POLL, pollId],
      queryFn: () => {
        return apiClient.get(`${API.POLL}/${pollId}`).then((res) => res.data);
      },
      enabled: !!pollId,
    });
  };

  const voteMutation = useMutation({
    mutationFn: (form: VoteProps) => {
      const pollId = form.pollId;
      return apiClient
        .post(`${API.VOTE}/${pollId}`, { option_index: form.optionIndex })
        .then((res) => res.data);
    },
  });

  return {
    polls,
    refetchPolls,
    voteMutation,
    useGetPoll,
  };
};

export default usePollController;
