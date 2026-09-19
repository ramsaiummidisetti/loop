"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

type Member = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type MembersResponse = {
  members?: Member[];
  error?: string;
};

type CreateMemberResponse = {
  member?: Member;
  error?: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"ANALYST" | "VIEWER">("ANALYST");

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/members", {
        method: "GET",
        cache: "no-store",
      });

      const data: MembersResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load members");
      }

      setMembers(data.members ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load members"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, []);

    async function handleCreateMember(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        const response = await fetch("/api/members", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            name,
            email,
            password,
            role,
            }),
        });

        const data: CreateMemberResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.error ?? "Unable to create member");
        }

        if (data.member) {
            setMembers((currentMembers) =>
            [...currentMembers, data.member as Member].sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            );
        }

        setName("");
        setEmail("");
        setPassword("");
        setRole("ANALYST");

        setSuccess("Member created successfully.");
        } catch (err) {
        setError(
            err instanceof Error ? err.message : "Unable to create member"
        );
        } finally {
        setSubmitting(false);
        }
    }
        async function handleRoleChange(
        memberId: string,
        newRole: "ANALYST" | "VIEWER"
        ) {
        try {
            setUpdatingMemberId(memberId);
            setError("");
            setSuccess("");

            const response = await fetch(`/api/members/${memberId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                role: newRole,
            }),
            });

            const data: CreateMemberResponse = await response.json();

            if (!response.ok) {
            throw new Error(data.error ?? "Unable to update member role");
            }

            if (data.member) {
            setMembers((currentMembers) =>
                currentMembers.map((member) =>
                member.id === memberId
                    ? (data.member as Member)
                    : member
                )
            );
            }

            setSuccess("Member role updated successfully.");
        } catch (err) {
            setError(
            err instanceof Error
                ? err.message
                : "Unable to update member role"
            );
        } finally {
            setUpdatingMemberId(null);
        }
        }
        async function handleRemoveMember(member: Member) {
    const confirmed = window.confirm(
        `Remove ${member.name} from this workspace?\n\nThis member will no longer be able to log in to LOOP.`
    );

    if (!confirmed) {
        return;
    }

    try {
        setRemovingMemberId(member.id);
        setError("");
        setSuccess("");

        const response = await fetch(`/api/members/${member.id}`, {
        method: "DELETE",
        });

        const data: { message?: string; error?: string } =
        await response.json();

        if (!response.ok) {
        throw new Error(data.error ?? "Unable to remove member");
        }

        setMembers((currentMembers) =>
        currentMembers.filter(
            (currentMember) => currentMember.id !== member.id
        )
        );

        setSuccess(`${member.name} was removed successfully.`);
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : "Unable to remove member"
        );
    } finally {
        setRemovingMemberId(null);
    }
    }
  function getRoleStyle(memberRole: UserRole) {
    if (memberRole === "ADMIN") {
      return "bg-violet-100 text-violet-700 ring-violet-200";
    }

    if (memberRole === "ANALYST") {
      return "bg-blue-100 text-blue-700 ring-blue-200";
    }

    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  }

  function getInitials(memberName: string) {
    return memberName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
              L
            </div>

            <div className="hidden sm:block">
              <p className="text-lg font-black tracking-tight text-slate-900">
                LOOP
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Feedback Intelligence
              </p>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/feedback"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Feedback
            </Link>

            <Link
              href="/dashboard/feedback#semantic-search"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Search
            </Link>

            <Link
              href="/dashboard#insights"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Insights
            </Link>

            <Link
              href="/dashboard/members"
              className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"
            >
              Members
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
          <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            <Link
              href="/dashboard"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/feedback"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Feedback
            </Link>

            <Link
              href="/dashboard/feedback#semantic-search"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Search
            </Link>

            <Link
              href="/dashboard#insights"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Insights
            </Link>

            <Link
              href="/dashboard/members"
              className="whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"
            >
              Members
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-200 sm:p-9">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              Workspace Administration
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Team Members
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Manage the people who access your LOOP workspace and assign
              Analyst or Viewer permissions.
            </p>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.5fr_1fr]">
          {/* Members */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Workspace Members
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {members.length} member{members.length === 1 ? "" : "s"} in
                  this workspace
                </p>
              </div>

              <div className="hidden rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 sm:block">
                Admin Only
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="font-bold text-slate-700">
                  No workspace members found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Create an Analyst or Viewer using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white">
                      {getInitials(member.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900">
                        {member.name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                    {member.role === "ADMIN" ? (
                        <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getRoleStyle(
                            member.role
                        )}`}
                        >
                        ADMIN
                        </span>
                    ) : (
                        <>
                        <select
                            value={member.role}
                            disabled={
                            updatingMemberId === member.id ||
                            removingMemberId === member.id
                            }
                            onChange={(event) =>
                            void handleRoleChange(
                                member.id,
                                event.target.value as "ANALYST" | "VIEWER"
                            )
                            }
                            aria-label={`Change role for ${member.name}`}
                            className={`rounded-xl border-0 px-3 py-2 text-xs font-black outline-none ring-1 ${getRoleStyle(
                            member.role
                            )} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => void handleRemoveMember(member)}
                            disabled={removingMemberId === member.id}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {removingMemberId === member.id ? "Removing..." : "Remove"}
                        </button>
                        </>
                    )}
                    </div>
                    
                
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add member */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-200">
                +
              </div>

              <h2 className="text-xl font-black text-slate-900">
                Add Member
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Create an Analyst or Viewer account for this workspace.
              </p>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Name
                </label>

                <input
                  id="member-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter member name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="member-email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="member@example.com"
                  required
                  maxLength={255}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="member-password"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                <input
                    id="member-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                    {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                    ) : (
                    <Eye className="h-5 w-5" />
                    )}
                </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="member-role"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Role
                </label>

                <select
                  id="member-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as "ANALYST" | "VIEWER")
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="ANALYST">ANALYST</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating Member..." : "Create Member"}
              </button>
            </form>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-bold text-slate-700">Security:</span>{" "}
                Member accounts are automatically assigned to your current
                workspace. Admin accounts cannot be created from this form.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}