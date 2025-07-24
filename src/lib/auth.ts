
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next"

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

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // On sign-in, add the user ID to the token
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add the user ID from the token to the session object
            if (session.user) {
                (session.user as CustomUser).id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
        signOut: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);
