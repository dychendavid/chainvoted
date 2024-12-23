import NextAuth, { Session } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

export type AuthorizedSession = Session & {
  token: string;
};

export const authOptions = {
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      idToken: true,
    }),
    // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: "David Chen <dychen.1st@gmail.com>",
    // }),
  ],
  callbacks: {
    async jwt({ token, account }) {
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
                google_token: account.id_token,
              }),
            }
          );

          const res = await response.json();
          token.token = res.data;
        } catch (error) {
          console.error("Backend login failed:", error);
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      // save backend token in client session
      session.token = token.token;
      return session;
    },
  },
};

export default NextAuth(authOptions);
