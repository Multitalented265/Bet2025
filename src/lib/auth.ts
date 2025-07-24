
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("--- [auth.ts - authorize] ---");
                if (!credentials?.email || !credentials.password) {
                    console.log("[authorize] Missing credentials");
                    return null;
                }

                console.log(`[authorize] Looking up user: ${credentials.email}`);
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    console.log(`[authorize] User not found or no password set for: ${credentials.email}`);
                    return null;
                }

                console.log(`[authorize] User found. Verifying password...`);
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    console.log(`[authorize] Password invalid for: ${credentials.email}`);
                    return null;
                }
                
                console.log(`[authorize] Password valid. Returning user object:`, { id: user.id, name: user.name, email: user.email });
                // Return the user object to be passed to the jwt callback
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log("--- [auth.ts - jwt callback] ---");
            // The `user` object is passed on the first sign-in
            if (user) {
                console.log("[jwt] Initial sign-in. Attaching user data to token.");
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            } else {
                 console.log("[jwt] Subsequent request. Token already has data.");
            }
            console.log("[jwt] Final token:", token);
            return token;
        },
        async session({ session, token }) {
            console.log("--- [auth.ts - session callback] ---");
            // The token is passed from the `jwt` callback
            if (session.user && token) {
                 console.log("[session] Hydrating session with token data.");
                (session.user as NextAuthUser & { id: string }).id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
            } else {
                 console.log("[session] session.user or token is missing. Cannot hydrate session.");
            }
            console.log("[session] Final session:", session);
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);
