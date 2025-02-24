// app/exec-body/ExecBodyPageWrapper.server.tsx
import { prisma } from "@/lib/prisma";
import ExecBodyPageClient from "./ExecBodyPageClient";
import SessionProviderWrapper from "@/components/Admin/SessionProviderWrapper";
import { getServerSession } from "next-auth"; // Get session using next-auth
import { authOptions } from "@/lib/auth"; // Your auth options

export default async function ExecBodyPageWrapper() {

  const session = await getServerSession(authOptions);

  const [execContent, execMembers] = await Promise.all([
    prisma.pageContent.findUnique({
      where: { pageSlug: 'exec-body' }
    }),
    prisma.execMember.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        position: true,
        imageUrl: true,
        order: true,
        createdAt: true
      }
    })
  ]);

  return (
    <SessionProviderWrapper session={session}>
      <ExecBodyPageClient
        execContent={execContent}
        initialMembers={execMembers}
      />
    </SessionProviderWrapper>
  );
}
