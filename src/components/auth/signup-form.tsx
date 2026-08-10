"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      إنشاء الحساب
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUpAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div>
        <Label htmlFor="fullName">الاسم الكامل</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="مثال: سارة العتيبي"
          error={state.fieldErrors?.fullName}
        />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          placeholder="you@example.com"
          error={state.fieldErrors?.email}
        />
      </div>

      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          placeholder="8 أحرف على الأقل"
          error={state.fieldErrors?.password}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          error={state.fieldErrors?.confirmPassword}
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-ink-500">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
