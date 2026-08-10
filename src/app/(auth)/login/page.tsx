import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول | موقعي",
  description: "سجّل دخولك إلى لوحة تحكم موقعي لإدارة موقع نشاطك التجاري.",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-800">
        مرحبًا بعودتك
      </h1>
      <p className="mb-6 text-center text-sm text-ink-500">
        سجّل الدخول لمتابعة إدارة موقعك
      </p>
      <LoginForm />
    </div>
  );
}
