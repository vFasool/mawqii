import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * يُستخدم فقط داخل "use client" components.
 * يعتمد على NEXT_PUBLIC_* لأن مفتاح anon مصمم أصلًا ليكون علنيًا؛
 * الحماية الحقيقية تأتي من سياسات RLS في قاعدة البيانات، وليس من إخفاء هذا المفتاح.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "متغيرات Supabase غير مضبوطة. تأكد من NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local"
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
