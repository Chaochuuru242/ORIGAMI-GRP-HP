import { MemberSidebar } from "@/components/layout/member-sidebar";
import { requireUser } from "@/lib/auth/guards";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <MemberSidebar role={profile.role} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
