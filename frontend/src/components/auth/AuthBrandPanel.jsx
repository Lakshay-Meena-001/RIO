export default function AuthBrandPanel() {
  return (
              <div className="relative hidden min-h-0 overflow-hidden border-r border-white/10 bg-[#101214] p-10 lg:p-12 md:flex md:flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-white/[0.015]" />

                <div className="relative z-10">
                  <div className="flex items-center">
                    <div className="leading-none">
                      <p
                        className="text-[16px] font-bold tracking-[0.22em] text-white"
                        style={{
                          fontFamily: '"Zen Dots", sans-serif',
                        }}
                      >
                        RIO
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35">
                        Career Intelligence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 my-auto max-w-[320px]">
                  <div className="mb-6 h-1 w-12 rounded-full bg-white" />

                  <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white">
                    Your career,
                    <span className="mt-2 block font-serif font-normal italic text-white/75">
                      with direction.
                    </span>
                  </h2>

                  <p className="mt-6 text-sm leading-7 text-white/45">
                    Practice, learn, measure your progress, and build a clearer
                    path toward the role you are targeting.
                  </p>
                </div>

                <div className="relative z-10">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/25">
                    Practice · Improve · Grow
                  </p>
                </div>
              </div>

  );
}
