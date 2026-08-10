"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInAction, type AuthActionState } from "@/app/(auth)/actions";

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" size="lg">
      تسجيل الدخول
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-5">
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
          autoComplete="current-password"
          dir="ltr"
          error={state.fieldErrors?.password}
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-ink-500">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}
