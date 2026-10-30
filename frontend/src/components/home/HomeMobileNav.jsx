export default function HomeMobileNav() {
  return (
    <>
      <nav className="fixed left-4 right-4 top-3 z-40 flex h-[58px] flex-col items-center justify-center rounded-full border border-white/[0.10] bg-[#17191C]/72 shadow-[0_16px_45px_rgba(0,0,0,0.28)] backdrop-blur-[32px] backdrop-saturate-150 lg:hidden">
        <div
          className="flex min-w-0 flex-col items-center justify-center leading-none"
          aria-label="RIO Career Intelligence"
        >
          <span
            className="text-[16px] tracking-tight text-white"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>

          <span className="mt-1 text-[7px] font-medium tracking-[0.12em] text-white/55">
            CAREER INTELLIGENCE
          </span>
        </div>
      </nav>
    </>
  );
}
