import applyCaseMiddleware from "axios-case-converter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "@/configs/api";
import apiBase from "@/lib/api";
import { PollProps } from "@/stores/PollStore";

const usePollController = (user_id: number) => {
  const { data: polls, refetch: refetchPolls } = useQuery<PollProps[]>({
    queryKey: [API.POLL],
    queryFn: () => {
      const client = applyCaseMiddleware(apiBase);
      return client.get(API.POLL).then((res) => res.data);
    },
    // enabled: !!user_id,
  });

  return {
    polls,
    refetchPolls,
  };
};

export default usePollController;
