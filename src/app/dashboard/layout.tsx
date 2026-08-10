import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // خط دفاع ثانٍ إلى جانب middleware.ts (لا يعتمد الأمان على هذا الشرط وحده،
  // فـ RLS في قاعدة البيانات هي خط الدفاع الحقيقي).
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-500 sm:inline">{user.email}</span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
