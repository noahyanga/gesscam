// In your NextAuth configuration (e.g., [..nextauth].js or route.ts)
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) {
						throw new Error("Missing credentials");
					}

					if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
						throw new Error("Invalid email format");
					}

					const user = await prisma.user.findUnique({
						where: { email: credentials.email },
						select: { id: true, email: true, password: true, role: true, username: true }
					});

					if (!user) {
						throw new Error("Invalid credentials");
					}

					const isValid = await bcrypt.compare(credentials.password, user.password);

					if (!isValid) {
						throw new Error("Invalid credentials");
					}

					// Return user with the role to be included in the session
					return { id: user.id, email: user.email, role: user.role, username: user.username };
				} catch (error) {
					console.error("Authentication error:", error.message);
					return null;
				}
			},
		}),
	],
	session: { strategy: "jwt" },
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.username = user.username || "unknown";
				token.role = user.role; // Add role to token
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.id;
			session.user.email = token.email;
			session.user.username = token.username || "unknown";
			session.user.role = token.role;

			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: process.env.NODE_ENV !== "production",
};

// Named exports for GET and POST requests
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);

