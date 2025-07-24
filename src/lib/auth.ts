
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

interface CustomUser extends NextAuthUser {
    id: string;
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                // The user object returned here will be used by the adapter
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        // When using a database adapter, the default strategy is "database".
        // Explicitly setting it can be redundant but is fine. The key is the callback.
        strategy: "database", 
    },
    callbacks: {
        // This callback is essential to attach the user's ID to the session object.
        // The `user` object here is provided by the adapter from the database.
        session({ session, user }) {
            if (session.user) {
                (session.user as CustomUser).id = user.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/", // The login page is at the root
        signOut: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get the session on the server side
export const getSession = () => getServerSession(authOptions);
