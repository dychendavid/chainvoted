import applyCaseMiddleware from "axios-case-converter";
import { useMutation, useQuery, useQueries } from "@tanstack/react-query";
import { API } from "@/configs/api";
import apiBase from "@/lib/api";
import { PollProps, VoteProps } from "@/stores/PollStore";
import apiClient from "@/lib/api";

const usePollController = (user_id: number) => {
  const { data: polls, refetch: refetchPolls } = useQuery<PollProps[]>({
    queryKey: [API.POLL],
    queryFn: () => {
      return apiClient.get(API.POLL).then((res) => res.data);
    },
    // enabled: !!user_id,
  });

  const usePoll = (pollId: number) => {
    return useQuery<PollProps>({
      queryKey: [API.POLL, pollId],
      queryFn: () => {
        return apiClient.get(`${API.POLL}/${pollId}`).then((res) => res.data);
      },
      // enabled: !!user_id,
    });
  };

  const voteMutation = useMutation({
    mutationFn: (form: VoteProps) => {
      return apiClient.post(`${API.VOTE}`, { ...form }).then((res) => res.data);
    },
  });

  return {
    polls,
    refetchPolls,
    voteMutation,
    usePoll,
  };
};

export default usePollController;
