import { RioLogo } from "./HomePrimitives.jsx";
import { FaArrowRight } from "react-icons/fa";

export default function HomeDesktopNav({ openLogin }) {
  return (
    <>
      <nav className="fixed left-4 right-4 top-4 z-40 hidden h-[68px] rounded-full border border-white/[0.12] bg-[#17191C]/62 shadow-[0_18px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[32px] backdrop-saturate-150 lg:block xl:left-8 xl:right-8">
        <div className="mx-auto flex h-full w-full  max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <RioLogo />

          <div className="hidden items-center gap-8 text-xs font-medium text-white/[0.62] md:flex">
            <button
              onClick={() =>
                document
                  .getElementById("product")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transition-colors hover:text-white"
            >
              Product
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("agents")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transition-colors hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transition-colors hover:text-white"
            >
              How it works
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("roadmap")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transition-colors hover:text-white"
            >
              Roadmap
            </button>
          </div>

          <button
            type="button"
            onClick={openLogin}
            className="group flex h-10 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.045] px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-200 ease-out hover:border-white/30 hover:bg-white/[0.075]"
          >
            Login
            <FaArrowRight
              size={10}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </nav>
    </>
  );
}
