import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "إنشاء حساب | موقعي",
  description: "أنشئ حسابك في موقعي وابدأ ببناء موقع نشاطك التجاري خلال دقائق.",
};

export default function SignupPage() {
  return (
    <div>
      <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-800">
        أنشئ حسابك المجاني
      </h1>
      <p className="mb-6 text-center text-sm text-ink-500">
        خطوة واحدة تفصلك عن موقع احترافي لنشاطك
      </p>
      <SignupForm />
    </div>
  );
}
