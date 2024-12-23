import { AuthorizedSession } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";
import { getSession } from "next-auth/react";

const apiBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiBase.interceptors.request.use(async (config) => {
  const session = (await getSession()) as AuthorizedSession;

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export default apiBase;
