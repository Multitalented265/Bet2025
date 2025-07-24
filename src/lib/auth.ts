
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
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
                
                console.log(`[authorize] Password valid. Returning user object for session creation:`, { id: user.id, name: user.name, email: user.email });
                // Return the user object to be passed to the session
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        strategy: 'database'
    },
    callbacks: {
        async session({ session, user }) {
            console.log("--- [auth.ts - session callback] ---");
            // The user object here is the one from the database (thanks to the database strategy).
            if (session.user && user) {
                 console.log("[session] Hydrating session with user ID from database user object.");
                (session.user as NextAuthUser & { id: string }).id = user.id;
            } else {
                 console.log("[session] session.user or user object is missing. Cannot hydrate session.");
            }
            console.log("[session] Final session object:", session);
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
