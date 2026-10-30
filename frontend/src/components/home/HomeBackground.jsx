export default function HomeBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#17191C]" />

        <div
          className="absolute inset-0"
          style={{
            background: `
                radial-gradient(ellipse 62% 58% at 50% 18%,
                  rgba(255,255,255,0.055) 0%,
                  rgba(255,255,255,0.025) 30%,
                  transparent 68%),
                radial-gradient(circle at 6% 12%,
                  rgba(255,255,255,0.045) 0%,
                  transparent 31%),
                radial-gradient(circle at 95% 17%,
                  rgba(255,255,255,0.035) 0%,
                  transparent 33%),
                radial-gradient(circle at 8% 92%,
                  rgba(255,255,255,0.035) 0%,
                  transparent 34%),
                radial-gradient(circle at 92% 88%,
                  rgba(255,255,255,0.03) 0%,
                  transparent 35%),
                linear-gradient(135deg, #17191C 0%, #24272B 48%, #111315 100%)
              `,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 24%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.52) 100%)",
          }}
        />

        <div className="rio-grid absolute inset-0 opacity-60" />
      </div>
    </>
  );
}
