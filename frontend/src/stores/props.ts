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
