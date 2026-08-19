export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">
        Good Evening 👋
      </h1>

      <p className="mt-2 text-slate-400">
        Welcome back to StudyMate AI
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Overall Progress</p>
          <h2 className="mt-2 text-3xl font-bold">76%</h2>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Study Time</p>
          <h2 className="mt-2 text-3xl font-bold">2.4 hrs</h2>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <p className="text-slate-400">Average Quiz Score</p>
          <h2 className="mt-2 text-3xl font-bold">82%</h2>
        </div>
      </div>

      <section className="mt-8 rounded-xl bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Today&apos;s Study Plan
        </h2>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-slate-800 p-4">
            ✅ Python Revision
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            📚 Machine Learning – SVM
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            🧠 Data Mining – Apriori
          </div>
        </div>
      </section>
    </main>
  );
}