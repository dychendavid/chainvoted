import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      console.log("jwt");
      if (account) {
        // After Google login success, call your backend
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                googleToken: account.id_token,
              }),
            }
          );

          const data = await response.json();
          token.backendToken = data.access_token;
          token.accessToken = account.access_token;
        } catch (error) {
          console.error("Backend login failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session");
      if (token) {
        session.backendToken = token.backendToken as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
