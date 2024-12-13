import { useSession } from "next-auth/react";
import { useState } from "react";

export const useAuth = () => {
  const { data: session } = useSession();
  const [backendToken, setBackendToken] = useState<string | null>(null);

  const loginToBackend = async () => {
    if (session?.accessToken) {
      try {
        const response = await fetch("http://localhost:3001/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const data = await response.json();
        setBackendToken(data.access_token);
        return data.access_token;
      } catch (error) {
        console.error("Backend login failed:", error);
        return null;
      }
    }
  };

  return {
    session,
    backendToken,
    loginToBackend,
  };
};
