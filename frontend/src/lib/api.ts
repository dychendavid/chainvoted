import { AuthorizedSession } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";
import { getSession } from "next-auth/react";

const apiBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiBase.interceptors.request.use(async (config) => {
  const session = (await getSession()) as AuthorizedSession;

  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }

  return config;
});

const apiClient = applyCaseMiddleware(apiBase);
export default apiClient;

export enum ApiCallStatus {
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
