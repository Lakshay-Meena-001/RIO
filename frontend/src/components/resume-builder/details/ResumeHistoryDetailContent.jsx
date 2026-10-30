import { Pencil, X } from "lucide-react";
import ResumeForm from "../../../pages/resume/ResumeForm";

export default function ResumeHistoryDetailContent({
  editing, displayName, profile, cancelEdit, startEdit, data, setDraft, normalize,
  dirty, navigate, detailSections,
}) {
  return (
    <>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858994]">
                        {editing ? "EDITING YOUR RESUME" : "RESUME DETAILS"}
                      </p>
                      <h1 className="rio-detail-title mt-2 text-[27px] font-semibold leading-tight tracking-[-0.045em] text-[#F4F4F5] sm:text-[34px]">
                        {displayName}
                      </h1>
                      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#A1A1AA] sm:text-[15px]">
                        {profile.title ||
                          profile.headline ||
                          "Your experience, skills and achievements — thoughtfully organised in one place."}
                      </p>
                    </div>
                    {editing ? (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-white/[.10] bg-white/[.035] px-3.5 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/[.07]"
                      >
                        <X size={13} /> Cancel edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startEdit}
                        className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5"
                      >
                        <Pencil size={13} /> Edit resume
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <div className="rio-resume-fieldset">
                      <ResumeForm
                        data={data}
                        onChange={(next) => setDraft(normalize(next))}
                        onCreateNew={() => {
                          if (
                            !dirty ||
                            window.confirm(
                              "Leave this edit and open a new resume? Unsaved changes will be lost.",
                            )
                          )
                            navigate("/builder");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {detailSections.map(
                        ({ title, icon: Icon, content, count }) => (
                          <section
                            key={title}
                            className="rio-detail-section resume-history-item rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))] p-5 sm:p-6"
                          >
                            <div className="mb-5 flex items-center gap-3.5">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]">
                                <Icon size={18} />
                              </span>
                              <div className="min-w-0">
                                <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#F4F4F5]">
                                  {title}
                                </h2>
                                {Number.isFinite(count) && (
                                  <p className="mt-1 text-[10px] uppercase tracking-[.13em] text-[#777B85]">
                                    {count} {count === 1 ? "entry" : "entries"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">{content}</div>
                          </section>
                        ),
                      )}
                    </div>
                  )}
    </>
  );
}
