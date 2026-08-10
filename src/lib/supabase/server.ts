import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * يُستخدم داخل Server Components و Server Actions و Route Handlers.
 * يقرأ/يكتب الجلسة عبر الكوكيز حتى يبقى المستخدم مسجّلاً بين الطلبات.
 */
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "متغيرات Supabase غير مضبوطة. تأكد من NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local"
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // يحدث عند الاستدعاء من Server Component بدون تعديل استجابة —
          // آمن للتجاهل لأن middleware.ts يتكفّل بتحديث الجلسة فعليًا.
        }
      },
    },
  });
}

/**
 * Client بصلاحيات service_role — يتجاوز RLS بالكامل.
 * لا يُستخدم إلا داخل Route Handlers لعمليات محددة تتطلب صلاحيات إدارية
 * (مثال: قراءة موقع منشور بأداء أعلى، أو مهام صيانة). لا يصل هذا الملف إطلاقًا
 * إلى أي كود يُشحن للمتصفح لأنه يُستورد فقط من ملفات ".ts" على السيرفر.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY غير مضبوط — لا يجب أن يُستخدم هذا Client بدونه.");
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
