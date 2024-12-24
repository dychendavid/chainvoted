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
