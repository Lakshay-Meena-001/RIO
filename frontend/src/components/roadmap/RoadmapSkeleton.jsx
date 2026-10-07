const RoadmapSkeleton = ({ variant = "detail" }) => {
  if (variant === "history") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.05]" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-white/[0.05]" />

                <div className="mt-2 h-3 w-1/3 rounded bg-white/[0.04]" />

                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-20 rounded-lg bg-white/[0.04]" />
                  <div className="h-6 w-24 rounded-lg bg-white/[0.04]" />
                  <div className="h-6 w-20 rounded-lg bg-white/[0.04]" />
                </div>

                <div className="mt-4 h-1 rounded-full bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7">
        <div className="h-3 w-24 rounded bg-white/[0.05]" />

        <div className="mt-3 h-7 w-3/4 rounded-lg bg-white/[0.06] sm:h-9 sm:w-1/2" />

        <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/[0.04]" />

        <div className="mt-5 flex flex-wrap gap-2">
          <div className="h-7 w-28 rounded-full bg-white/[0.04]" />
          <div className="h-7 w-24 rounded-full bg-white/[0.04]" />
          <div className="h-7 w-24 rounded-full bg-white/[0.04]" />
          <div className="h-7 w-20 rounded-full bg-white/[0.04]" />
        </div>
      </section>

      {/* Overview */}
      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7">
        <div className="h-5 w-32 rounded bg-white/[0.05]" />

        <div className="mt-5 h-2 rounded-full bg-white/[0.05]" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4"
            >
              <div className="h-3 w-16 rounded bg-white/[0.04]" />
              <div className="mt-3 h-6 w-12 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </section>

      {/* Current focus */}
      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7">
        <div className="h-3 w-24 rounded bg-white/[0.04]" />

        <div className="mt-3 h-6 w-2/3 rounded bg-white/[0.06]" />

        <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/[0.04]" />

        <div className="mt-5 h-11 w-36 rounded-xl bg-white/[0.06]" />
      </section>

      {/* Learning path */}
      <section>
        <div className="mb-5">
          <div className="h-3 w-20 rounded bg-white/[0.04]" />
          <div className="mt-2 h-7 w-48 rounded bg-white/[0.06]" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="ml-9 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:ml-12 sm:rounded-3xl"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.05]" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 rounded bg-white/[0.05]" />
                  <div className="mt-2 h-3 w-full rounded bg-white/[0.04]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.04]" />
                </div>

                <div className="h-9 w-9 rounded-xl bg-white/[0.04]" />
              </div>

              <div className="mt-4 flex gap-2">
                <div className="h-7 w-20 rounded-lg bg-white/[0.04]" />
                <div className="h-7 w-24 rounded-lg bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RoadmapSkeleton;
