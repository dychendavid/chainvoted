import { UserProps } from "@/stores/userStore";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: UserProps;
    accessToken?: string;
    backendToken?: string;
  }
}
