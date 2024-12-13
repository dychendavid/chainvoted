import { create } from "zustand";
import { PollProps } from "./props";

export type PollStoreProps = {
  setCurrentPoll: (poll: PollProps) => void;
  setTotalVotes: (num: number) => void;
  poll: PollProps;
  totalVotes: number;
};

const usePollStore = create<PollStoreProps>((set, get) => ({
  poll: null,
  totalVotes: 0,
  setTotalVotes: (totalVotes: number) => {
    set({
      totalVotes,
    });
  },
  setCurrentPoll: (poll: PollProps) => {
    set({
      poll,
    });
  },
}));

export default usePollStore;
