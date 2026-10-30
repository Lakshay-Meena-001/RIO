import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";

export default function HomeFinalCta({ openLogin }) {
  return (
    <>
        <section className="relative z-10 px-5 pb-24 pt-12 sm:pb-32 sm:pt-20 lg:px-10 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-[1200px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] px-6 py-12 text-center shadow-[0_40px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-10 sm:py-10 lg:px-16 lg:py-24"
          >
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.62]">
              Start building momentum
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,6vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
              Your preparation can be
              <span
                className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
                style={{ letterSpacing: "-0.045em" }}
              >
                a system.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/[0.58] sm:text-base">
              Create your profile, take your first assessment and let RIO turn
              the result into your next move.
            </p>

            <button
              type="button"
              onClick={openLogin}
              className="group mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-[#17191C] shadow-[0_18px_50px_rgba(255,255,255,0.08)] transition-all duration-200 ease-out hover:-translate-y-0.5"
            >
              Start your journey
              <FiArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        </section>
    </>
  );
}
