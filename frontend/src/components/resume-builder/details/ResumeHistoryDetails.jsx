export function DetailText({ label, value }) {
  if (value === undefined || value === null || String(value).trim() === "")
    return null;
  return (
    <div className="min-w-0 rounded-xl border border-white/[.07] bg-white/[.025] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/40">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-[14px] leading-6 text-white/85">
        {String(value)}
      </p>
    </div>
  );
}
export function EntryList({
  items,
  titleKeys,
  subtitleKeys,
  dateKeys,
  descriptionKeys,
}) {
  if (!items?.length)
    return (
      <div className="rounded-xl border border-dashed border-white/[.10] bg-white/[.015] px-4 py-5 text-[13px] text-white/40">
        No details added yet.
      </div>
    );
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        if (typeof item === "string")
          return (
            <p
              key={`${item}-${index}`}
              className="rounded-xl border border-white/[.08] bg-white/[.025] px-4 py-3.5 text-[14px] leading-6 text-white/80"
            >
              {item}
            </p>
          );
        const pick = (keys) =>
          keys
            .map((key) => item?.[key])
            .find(
              (value) =>
                value !== undefined && value !== null && String(value).trim(),
            );
        const title = pick(titleKeys) || `Entry ${index + 1}`;
        const subtitle = pick(subtitleKeys);
        const dates = dateKeys
          .map((key) => item?.[key])
          .filter(Boolean)
          .join(" · ");
        const description = pick(descriptionKeys);
        return (
          <div
            key={item?._id || `${title}-${index}`}
            className="rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018))] p-4 sm:p-5"
          >
            <p className="text-[15px] font-semibold leading-6 text-white/90">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1.5 text-[13px] leading-5 text-white/60">
                {subtitle}
              </p>
            )}
            {dates && (
              <p className="mt-2 inline-flex rounded-lg border border-white/[.07] bg-black/15 px-2.5 py-1 text-[11px] text-white/45">
                {dates}
              </p>
            )}
            {description && (
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-white/70">
                {description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

