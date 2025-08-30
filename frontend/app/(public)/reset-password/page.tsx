import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/feature/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
