import { SiFirebase } from "react-icons/si";
import { RioLogo, GlassLine } from "./HomePrimitives.jsx";

export default function HomeFooter({ openLogin }) {
  return (
    <>
        <footer className="relative z-10 border-t border-white/[0.08] px-5 pb-16 pt-12 lg:px-10 lg:pb-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div>
                <RioLogo />
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/[0.62]">
                  AI-powered career intelligence for deliberate interview
                  preparation and measurable professional growth.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                  Product
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/[0.58]">
                  <button
                    onClick={() =>
                      document
                        .getElementById("product")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block w-fit transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() =>
                      document
                        .getElementById("agents")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block w-fit transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    AI Agents
                  </button>
                  <button
                    onClick={() =>
                      document
                        .getElementById("roadmap")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block w-fit transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Roadmap
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                  Platform
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/[0.58]">
                  <button
                    onClick={openLogin}
                    className="block w-fit transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Get started
                  </button>
                  <span className="block">Interview practice</span>
                  <span className="block">Skill intelligence</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                  Security
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/[0.42]">
                  <SiFirebase size={13} />
                  Firebase secured
                </div>
                <p className="mt-4 text-xs leading-5 text-white/[0.38]">
                  Built with security and privacy as part of the product
                  foundation.
                </p>
              </div>
            </div>

            <GlassLine className="mt-12" />

            <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[0.15em] text-white/[0.38] sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} RIO. All rights reserved.
              </span>
              <span>Career Intelligence</span>
            </div>
          </div>
        </footer>
    </>
  );
}
