import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar pendingCount={count ?? 0} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
