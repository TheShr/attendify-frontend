import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-16 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Attendify</h1>
        <p className="text-sm text-muted-foreground">AI-powered attendance management system</p>
      </div>
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-xs text-center text-gray-500">
          Need public insights? <Link href="/dept" className="underline">Education Dept</Link>
          <span className="mx-1 text-gray-400">|</span>
          <Link href="/policymaker" className="underline">Policymaker</Link>
        </p>
        <p className="mt-2 text-xs text-center text-gray-500">
          Need an account? <Link href="/admin/register" className="underline text-blue-600">Register as Admin</Link>
        </p>
      </div>
    </div>
  );
}


