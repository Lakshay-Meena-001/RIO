import { ArrowLeft, ArrowRight, Check, FileText, Plus, RefreshCw, Search, X } from "lucide-react";

export default function ResumeHistorySidebar(props) {
  const {
    loadHistory, selectedId, loadingList, history, query, setQuery, setHistoryPage,
    filtered, pagedHistory, dateLabel, navigate, chooseResume, mobileHistoryOpen,
    historyPage, historyPages,
  } = props;
  return (
<aside
  className={`absolute top-4 bottom-20 left-4 flex w-[min(282px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[24px] border border-white/[.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[min(282px,calc(100vw-2rem))] lg:translate-x-0 ${mobileHistoryOpen ? "z-[90] translate-x-0" : "z-50 -translate-x-[calc(100%+1rem)]"}`}
>
  <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-5 pb-5 pt-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
          Your career
        </p>
        <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-white">
          Resume history
        </h1>
        <p className="mt-1.5 text-[11px] leading-5 text-[#70727A]">
          Every version, detail and next step — in one place.
        </p>
      </div>
      <button
        type="button"
        onClick={() => loadHistory(selectedId)}
        disabled={loadingList}
        aria-label="Refresh resume history"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#9B9DA4] transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
      >
        <RefreshCw
          size={13}
          className={loadingList ? "animate-spin" : ""}
        />
      </button>
    </div>
    <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
      <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
        Saved resumes
      </span>
      <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
        {history.length}
      </span>
    </div>
    <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <Search size={13} className="shrink-0 text-[#686B74]" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHistoryPage(1);
        }}
        placeholder="Find a resume…"
        className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
      />
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setHistoryPage(1);
        }}
        aria-label="Clear search"
        className={query ? "text-[#777B85] hover:text-white" : "hidden"}
      >
        <X size={13} />
      </button>
    </label>
  </div>
  <div className="rio-history-scroll min-h-0 flex-1 overflow-y-auto">
    {loadingList && !history.length && (
      <div className="flex min-h-[250px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
          <p className="text-[11px] text-[#696B72]">
            Loading your resumes…
          </p>
        </div>
      </div>
    )}
    {!loadingList && filtered.length === 0 && (
      <div className="px-5 py-12">
        <div className="h-px w-10 bg-white/20" />
        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
          {query ? "No matches" : "A fresh start"}
        </p>
        <p className="mt-2 text-[17px] font-semibold tracking-[-0.03em] text-white">
          {query ? "Nothing found." : "No resumes yet."}
        </p>
        <p className="mt-3 text-[11px] leading-5 text-[#70727A]">
          {query
            ? "Try another name or clear your search."
            : "Create your first resume and it will live here."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/builder")}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-[#17191C]"
        >
          <Plus size={13} /> Create resume
        </button>
      </div>
    )}
    {pagedHistory.map((item, index) => {
      const active = String(item._id) === String(selectedId);
      return (
        <button
          key={item._id}
          type="button"
          onClick={() => {
            chooseResume(item._id);
            setMobileHistoryOpen(false);
          }}
          className={`resume-history-item group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-[18px] text-left transition-colors ${active ? "bg-white/[0.065]" : "hover:bg-white/[0.035]"}`}
          style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
        >
          {active && (
            <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
          )}
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] bg-white/[0.025] text-[#777B85] group-hover:text-[#C4C6CC]"}`}
          >
            <FileText size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 block text-xs font-semibold leading-4 text-white">
              {item.profile?.name?.trim() || "Untitled resume"}
            </span>
            <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.09em] text-[#66686F]">
              {item.profile?.title ||
                item.profile?.headline ||
                item.profile?.email ||
                "Professional resume"}
            </span>
            <span className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#55575E]">
                {dateLabel(item.updatedAt || item.createdAt)}
              </span>
              {active && <Check size={12} className="text-white" />}
            </span>
          </span>
        </button>
      );
    })}
  </div>
  <div className="shrink-0 border-t border-white/[.07] px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-[#858994]">
        Page {historyPage} of {historyPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={historyPage <= 1}
          onClick={() =>
            setHistoryPage((page) => Math.max(1, page - 1))
          }
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#D4D4D8] disabled:opacity-30"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          disabled={historyPage >= historyPages}
          onClick={() =>
            setHistoryPage((page) => Math.min(historyPages, page + 1))
          }
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#D4D4D8] disabled:opacity-30"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  </div>
</aside>
  );
}
