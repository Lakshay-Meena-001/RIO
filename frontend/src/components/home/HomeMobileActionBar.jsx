import { FaArrowRight } from "react-icons/fa";

export default function HomeMobileActionBar({ openLogin, openSignup }) {
  return (
    <>
        <nav
          aria-label="Authentication quick actions"
          className="rio-mobile-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md items-center gap-2">
            <button
              type="button"
              onClick={openLogin}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.045] px-3 py-3 text-xs font-semibold text-[#E4E4E7] transition active:scale-[0.98]"
            >
              Login <FaArrowRight size={12} />
            </button>
            <button
              type="button"
              onClick={openSignup}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-semibold text-[#17191C] transition active:scale-[0.98]"
            >
              Sign up <FaArrowRight size={12} />
            </button>
          </div>
        </nav>
    </>
  );
}
