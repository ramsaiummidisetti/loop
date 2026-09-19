"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          workspaceName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left — Branding */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-indigo-600 shadow-lg">
                  L
                </div>

                <span className="text-2xl font-extrabold tracking-tight">
                  LOOP
                </span>
              </div>

              <div className="mt-24 max-w-lg">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                  Start Your Feedback Journey
                </span>

                <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight">
                  Build a smarter
                  <span className="block text-blue-100">
                    feedback workflow.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
                  Create your workspace, bring customer feedback together,
                  and use AI-powered intelligence to discover what matters.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg">
                  ✓
                </div>
                <div>
                  <p className="font-bold">Centralized feedback</p>
                  <p className="text-sm text-blue-100">
                    Keep customer voices organized.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg">
                  AI
                </div>
                <div>
                  <p className="font-bold">AI-powered analysis</p>
                  <p className="text-sm text-blue-100">
                    Discover sentiment and themes faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right — Signup */}
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white shadow-lg">
                  L
                </div>

                <span className="text-2xl font-extrabold text-slate-900">
                  LOOP
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
              <div className="mb-8">
                <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  Get started
                </span>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  Create your account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your workspace and start managing customer feedback.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Workspace */}
                <div>
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Workspace Name
                  </label>

                  <input
                    id="workspaceName"
                    name="workspaceName"
                    type="text"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    required
                    placeholder="Your company or workspace"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    This will be your feedback intelligence workspace.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                       <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-bold text-indigo-600 transition hover:text-violet-600"
              >
                Log in
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}