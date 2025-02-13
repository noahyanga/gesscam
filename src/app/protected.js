// pages/protected.js
import { getSession } from "next-auth/react";

export default function ProtectedPage({ user }) {
	return (
		<div>
			<h1>Welcome {user?.email}</h1>
			<p>This is a protected page</p>
		</div>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	return {
		props: { user: session.user }
	};
}
