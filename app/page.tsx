import Link from "next/link";

const capabilities = [
  {
    icon: "↗",
    title: "Feedback Management",
    description:
      "Collect, organize, search, filter, and manage customer feedback from one workspace.",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    icon: "✦",
    title: "AI Sentiment Analysis",
    description:
      "Understand whether customer feedback is positive, neutral, or negative.",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    icon: "⌁",
    title: "Theme Discovery",
    description:
      "Identify recurring topics and themes across your customer feedback.",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    icon: "⌕",
    title: "Semantic Search",
    description:
      "Find relevant feedback based on meaning instead of relying only on exact keywords.",
    iconClass: "bg-cyan-100 text-cyan-700",
  },
  {
    icon: "▥",
    title: "Analytics Dashboard",
    description:
      "Monitor feedback volume, status, sentiment, and trends through clear visualizations.",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "✧",
    title: "Actionable Insights",
    description:
      "Turn customer feedback into information your team can use to prioritize improvements.",
    iconClass: "bg-pink-100 text-pink-700",
  },
];

const workflow = [
  {
    number: "01",
    title: "Collect",
    description:
      "Bring customer feedback into one organized workspace through manual entry, imports, and integrations.",
    color: "bg-blue-600",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Analyze sentiment and themes to understand what customers are saying about your product.",
    color: "bg-violet-600",
  },
  {
    number: "03",
    title: "Discover",
    description:
      "Use search, trends, and insights to identify important customer patterns and areas that need attention.",
    color: "bg-indigo-600",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
              L
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">LOOP</div>
              <div className="-mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Feedback Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#features"
              className="transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#insights"
              className="transition hover:text-blue-600"
            >
              Insights
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 sm:px-4"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          {/* Hero copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              AI-Powered Feedback Intelligence
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Turn customer feedback into
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                actionable insights.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              LOOP brings customer feedback together, analyzes sentiment and
              themes, and helps your team discover what customers really care
              about.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Get Started
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span>✓ Workspace based</span>
              <span>✓ Role based access</span>
              <span>✓ AI-powered analysis</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-200/50 via-indigo-200/40 to-violet-200/50 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-3 shadow-2xl shadow-indigo-900/10">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Feedback Dashboard
                    </p>

                    <p className="text-xs text-slate-500">
                      Customer intelligence overview
                    </p>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-[10px] font-bold text-white">
                    AI INSIGHTS
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 p-5">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                      Feedback
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      248
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Total records
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      Positive
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      68%
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Sentiment
                    </p>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600">
                      Actioned
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      42
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Feedback
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="mx-5 mb-5 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        Feedback Trends
                      </p>

                      <p className="text-xs text-slate-500">
                        Customer feedback over time
                      </p>
                    </div>

                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                      30 DAYS
                    </span>
                  </div>

                  <div className="mt-6 flex h-32 items-end gap-2">
                    {[
                      32, 48, 42, 67, 54, 78, 63, 86, 72, 94, 80, 100,
                    ].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-violet-500 transition hover:from-blue-500 hover:to-violet-400"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between text-[9px] text-slate-400">
                    <span>30d ago</span>
                    <span>20d</span>
                    <span>10d</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* AI insight */}
                <div className="mx-5 mb-5 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm text-white">
                      ✦
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-950">
                        Latest AI Insight
                      </p>

                      <p className="text-[10px] text-violet-600">
                        Feedback intelligence
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    Customers are increasingly discussing product performance
                    and checkout experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-violet-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-6 lg:grid-cols-4 lg:px-8">
          <div className="px-5 py-8 text-center">
            <p className="text-2xl font-bold text-blue-600">01</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Unified Workspace
            </p>
          </div>

          <div className="px-5 py-8 text-center">
            <p className="text-2xl font-bold text-violet-600">AI</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Assisted Analysis
            </p>
          </div>

          <div className="px-5 py-8 text-center">
            <p className="text-2xl font-bold text-indigo-600">360°</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Feedback Visibility
            </p>
          </div>

          <div className="px-5 py-8 text-center">
            <p className="text-2xl font-bold text-emerald-600">24/7</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Accessible Insights
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Core capabilities
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Everything you need to understand your customers.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              From collecting feedback to discovering patterns, LOOP provides
              one place to understand the customer voice.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${capability.iconClass}`}
                >
                  {capability.icon}
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-950">
                  {capability.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              How LOOP works
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              From feedback to action.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              LOOP simplifies the process of turning scattered customer
              feedback into structured information and useful insights.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {workflow.map((item, index) => (
              <div
                key={item.number}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">
                    {item.number}
                  </span>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${item.color}`}
                  >
                    {index + 1}
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>

                {index < workflow.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden text-2xl font-light text-blue-300 lg:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section id="insights" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Customer intelligence
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              See the story behind your feedback.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              LOOP helps your team move beyond individual comments and
              understand broader customer patterns through sentiment, themes,
              trends, and semantic search.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Understand customer sentiment",
                "Identify recurring feedback themes",
                "Search feedback by meaning",
                "Monitor feedback trends",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xs text-white shadow-md shadow-blue-600/20">
                    ✓
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment card */}
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-5 shadow-xl shadow-indigo-900/5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Customer Sentiment
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current feedback distribution
                  </p>
                </div>

                <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
                  Overview
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[18px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-950">
                        68%
                      </p>
                      <p className="text-[10px] font-medium text-slate-500">
                        Positive
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4 text-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-emerald-700">
                        Positive
                      </span>
                      <span className="font-bold text-slate-950">68%</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[68%] rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-amber-700">
                        Neutral
                      </span>
                      <span className="font-bold text-slate-950">21%</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[21%] rounded-full bg-amber-400" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-rose-700">
                        Negative
                      </span>
                      <span className="font-bold text-slate-950">11%</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-[11%] rounded-full bg-rose-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs text-white">
                    ✦
                  </span>

                  <p className="text-xs font-bold text-slate-950">
                    AI Insight
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use feedback trends and sentiment distribution to identify
                  areas that deserve closer attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-bold text-white shadow-xl shadow-violet-500/20">
            L
          </div>

          <h2 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
            Close the loop on customer feedback.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Bring your feedback together, understand what customers are saying,
            and turn those signals into meaningful insights.
          </p>

          <div className="mt-9">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Start Using LOOP
              <span className="ml-2 text-blue-600">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                L
              </div>

              <p className="font-bold text-white">LOOP</p>
            </div>

            <p className="mt-2 text-xs">
              Feedback Intelligence Platform
            </p>
          </div>

          <div className="flex gap-6 text-xs">
            <a
              href="#features"
              className="transition hover:text-blue-400"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-blue-400"
            >
              How It Works
            </a>

            <Link
              href="/login"
              className="transition hover:text-blue-400"
            >
              Sign In
            </Link>
          </div>

          <p className="text-xs">
            © {new Date().getFullYear()} LOOP. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}