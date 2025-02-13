import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure your auth options are correctly imported

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Not authenticated</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1>Welcome, {session.user?.role}</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}

