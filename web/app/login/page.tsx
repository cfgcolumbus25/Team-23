"use client";

import React from "react";
import Link from "next/link";
import InputField from "@/components/onboarding/InputField";
import { useRouter } from "next/navigation";

// this is the login page for the application, it contains the login form and the logic for the login process
export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();

  // this function is called when the user submits the form, it logs the email and password to the console
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // log the email and password to the console
    // eslint-disable-next-line no-console
    console.log({ email, password });
    // after successful login, route to dashboard
    router.push("/dashboard");
  }

  // return the login page with the login form and the footer
  return (
    <div className="relative flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">CLEPBridge</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <InputField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/onboarding"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
      <footer className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-slate-400">Powered by Modern States</p>
      </footer>
    </div>
  );
}


