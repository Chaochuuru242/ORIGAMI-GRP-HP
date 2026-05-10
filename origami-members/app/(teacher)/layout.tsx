import { requireTeacherOrAdmin } from "@/lib/auth/guards";
import { MemberSidebar } from "@/components/layout/member-sidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireTeacherOrAdmin();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <MemberSidebar role={profile.role} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
