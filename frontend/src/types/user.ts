export type UserProps = {
  id: number;
  name: string;
  email: string;
  picture: string;
  isEmailVerified?: boolean;
  isSmsVerified?: boolean;
  isIdVerified?: boolean;
};
