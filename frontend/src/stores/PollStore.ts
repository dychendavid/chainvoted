import { create } from "zustand";
import { BigNumber } from "ethers";

export type PollStatUpdateDtoProps = {
  totalVotes: BigNumber;
  optionVotes: BigNumber[];
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
  cover: string;
  expiredAt: string;
  address: string;
  isEmailVerification: boolean;
  isSmsVerification: boolean;
  isIdVerification: boolean;
  isEnabledDonations: boolean;
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
    const stats = get().stats;
    stats.totalVotes = data.totalVotes;
    stats.optionVotes = data.optionVotes;
    set({
      stats,
    });
  },
}));

export default usePollStore;
