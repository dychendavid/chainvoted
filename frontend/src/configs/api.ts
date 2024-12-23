const API_BASE = process.env.NEXT_PUBLIC_API_URL;
export const API = {
  POLL: `${API_BASE}/poll`,
  USER: `${API_BASE}/user`,
  VOTE: `${API_BASE}/poll/vote`,
};
