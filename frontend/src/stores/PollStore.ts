import { create } from "zustand";
import { BigNumber } from "ethers";

export type PollStatUpdateDtoProps = {
  totalVotes: BigNumber;
  optionVotes: BigNumber[];
  isVoted?: boolean;
};

export type PollStatsDtoProps = {
  totalVotes: BigNumber;
  optionVotes: BigNumber[];
  isClosed: boolean;
  isVoted?: boolean;
};

export type PollProps = {
  id?: number;
  title: string;
  description: string;
  votes: number;
  cover: string;
  expiredAt: string;
  address: string;
  isVoted?: boolean;
  isEmailVerification: boolean;
  isSmsVerification: boolean;
  isIdVerification: boolean;
  isEnableDonations: boolean;
  options: PollOptionProps[];
};

export type PollOptionProps = {
  id?: number;
  pollId: number;
  title: string;
  description: string;
  cover: string;
  votes: number;
};

export type PollStoreProps = {
  poll: PollProps;
  stats: PollStatsDtoProps;
  setStats: (stat: PollStatsDtoProps) => void;
  updateStats: (data: PollStatUpdateDtoProps) => void;
  setPoll: (poll: PollProps) => void;
  getOptionVotes: (optionId: number) => number;
};

export type VoteProps = {
  pollId: number;
  optionIndex: number;
};

const usePollStore = create<PollStoreProps>((set, get) => ({
  stats: null,
  poll: null,
  setPoll: (poll: PollProps) => {
    set({
      poll,
    });
  },
  setStats: (stats: PollStatsDtoProps) => {
    set({
      stats,
    });
  },
  getOptionVotes: (optionId: number) => {
    return get().stats.optionVotes[optionId].toNumber();
  },
  updateStats: (data: PollStatUpdateDtoProps) => {
    set((state) => ({
      stats: {
        ...state.stats,
        isVoted: data.isVoted,
        totalVotes: data.totalVotes,
        optionVotes: data.optionVotes,
      },
    }));
  },
}));

export default usePollStore;
