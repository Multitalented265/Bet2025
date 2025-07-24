
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// Define a custom user type that includes the `id` property from your database
interface CustomUser extends NextAuthUser {
    id: string;
}

export const authOptions: NextAuthOptions = {
    // Use the Prisma adapter to connect NextAuth with your database
    adapter: PrismaAdapter(prisma),
    
    // Configure the session strategy
    session: {
        // 'database' strategy stores sessions in the database, handled by the Prisma adapter.
        // This is the most secure and robust method for production apps.
        strategy: "database", 
    },
    
    // Define authentication providers
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // This function is called when a user tries to sign in with credentials
                if (!credentials?.email || !credentials.password) {
                    // If email or password is not provided, authentication fails
                    return null;
                }

                // Find the user in the database by their email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // If no user is found or the user doesn't have a password set, fail
                if (!user || !user.password) {
                    return null;
                }

                // Compare the provided password with the hashed password in the database
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    // If passwords do not match, authentication fails
                    return null;
                }

                // If authentication is successful, return the user object
                // NextAuth will then use this object to create the session
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    
    // Define callbacks to customize NextAuth behavior
    callbacks: {
        // The `session` callback is called whenever a session is checked.
        // We use it to add the user's database ID to the session object.
        session({ session, user }) {
            if (session.user) {
                // Typecast `session.user` to our custom user type to add the `id`
                (session.user as CustomUser).id = user.id;
            }
            return session;
        },
    },

    // Define custom pages for authentication flow
    pages: {
        signIn: "/",      // The login page
        signOut: "/",     // Where to redirect after logout
        error: "/",       // Where to redirect on authentication errors
    },

    // A secret is required to sign and encrypt cookies and tokens
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get the session on the server-side
export const getSession = () => getServerSession(authOptions);
