import { getSession } from "next-auth/react";

export const api = {
  fetch: async (url: string, options: RequestInit = {}) => {
    const session = await getSession();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session?.backendToken}`,
        "Content-Type": "application/json",
      },
    });
  },
};
