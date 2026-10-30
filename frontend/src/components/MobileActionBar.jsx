/** Shared fixed mobile action-bar surface. Page-specific buttons remain children. */
export default function MobileActionBar({ children, className = "", style, ...props }) {
  return (
    <div
      className={`rio-mobile-action-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/92 px-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
