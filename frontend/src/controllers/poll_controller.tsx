import { API } from "@/configs/api";
import { PollProps } from "@/stores/props";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";
import _ from "lodash";

const usePollController = (user_id: number) => {
  const { data: polls, refetch: refetchPolls } = useQuery<PollProps[]>({
    queryKey: [API.POLL],
    queryFn: () => {
      const client = applyCaseMiddleware(axios.create());
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
