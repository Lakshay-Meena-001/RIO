import { useEffect, useRef, useState } from "react";

import {
  emptyEducation,
  emptyExperience,
  emptyProject,
} from "./resumeBuilderConstants";

import {
  inputClassName,
  textareaClassName,
  labelClassName,
} from "./resumeFormStyles";

/* -------------------------------------------------------------------------- */
/*                                  Inputs                                    */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  error = "",
  recommended = "",
}) {
  const length = (value ?? "").length;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClassName.replace("mb-2 ", "")}>{label}</label>

        {recommended && (
          <span className="shrink-0 text-[10px] text-white/30">
            {length}/{recommended}
          </span>
        )}
      </div>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`${inputClassName} ${
          error ? "border-red-300/60 focus:border-red-300" : ""
        }`}
      />

      {error && (
        <p role="alert" className="mt-1.5 text-[11px] leading-4 text-red-300">
          {error}
        </p>
      )}

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
  className,
}) {
  const textareaRef = useRef(null);

  const resize = () => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  useEffect(() => {
    const handleResize = () => resize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={value ?? ""}
      onChange={(event) => {
        onChange(event.target.value);
        requestAnimationFrame(resize);
      }}
      placeholder={placeholder}
      rows={rows}
      className={className}
      style={{
        overflowY: "hidden",
        resize: "none",
      }}
    />
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
  recommended = 1000,
}) {
  const text = value ?? "";
  const length = text.length;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClassName.replace("mb-2 ", "")}>{label}</label>

        {recommended && (
          <span className="shrink-0 text-[10px] text-white/30">
            {length}/{recommended} recommended
          </span>
        )}
      </div>

      <AutoResizeTextarea
        value={text}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={textareaClassName}
      />

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Tag Input                                  */
/* -------------------------------------------------------------------------- */

export function TagInput({ label, values = [], onChange, placeholder, hint }) {
  const [input, setInput] = useState("");

  const addValue = (value) => {
    const cleanedValue = value.trim();

    if (!cleanedValue) return;

    const alreadyExists = values.some(
      (item) => item.toLowerCase() === cleanedValue.toLowerCase(),
    );

    if (!alreadyExists) {
      onChange([...values, cleanedValue]);
    }

    setInput("");
  };

  const removeValue = (indexToRemove) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValue(input);
    }

    if (event.key === "Backspace" && !input && values.length > 0) {
      removeValue(values.length - 1);
    }
  };

  return (
    <div className="min-w-0">
      <label className={labelClassName}>{label}</label>

      <div
        className="
          w-full rounded-xl border border-white/[.09] bg-[#0e1015]/70 p-3
          shadow-[inset_0_1px_2px_rgba(0,0,0,.16)] transition
          focus-within:border-white/20
          focus-within:ring-4 focus-within:ring-white/[.03]
        "
      >
        {values.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="
                  inline-flex items-center gap-1.5 rounded-lg
                  border border-white/10 bg-white/[0.06]
                  px-2.5 py-1.5 text-xs text-white/80
                "
              >
                {value}

                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="text-white/35 transition hover:text-red-300"
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) addValue(input);
          }}
          placeholder={placeholder}
          className="
            w-full min-w-0 bg-transparent px-1 py-1 text-sm
            text-white outline-none placeholder:text-white/30
          "
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Section Wrapper                               */
/* -------------------------------------------------------------------------- */

export function FormSection({ title, description, children, action }) {
  return (
    <section className="w-full min-w-0 border-b border-white/[.10] pb-7 last:border-b-0">
      <div className="mb-5 flex flex-col gap-3 border-b border-white/[.075] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="
              relative pl-3 text-[19px] font-semibold
              tracking-[-.035em] text-white
              before:absolute before:bottom-1 before:left-0
              before:top-1 before:w-[3px] before:rounded-full
              before:bg-gradient-to-b before:from-white/80
              before:to-white/25 sm:text-[21px]
            "
          >
            {title}
          </h2>

          {description && (
            <p className="mt-1.5 pl-3 text-[11px] leading-5 text-white/45 sm:text-xs">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="w-full min-w-0">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Entry Header                                 */
/* -------------------------------------------------------------------------- */

export function EntryHeader({ title, subtitle, onRemove }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">
          {title}
        </p>

        {subtitle && (
          <p className="mt-1 text-[11px] leading-5 text-white/40">{subtitle}</p>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="
            hidden shrink-0 rounded-lg
            border border-red-400/10 bg-red-400/[0.04]
            px-3 py-2 text-xs font-medium text-red-300/80
            transition hover:border-red-400/20 hover:bg-red-400/[0.08]
            sm:block
          "
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Empty State                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({ title, description, actionLabel, onClick }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-white/[.12] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.025),transparent_65%),rgba(0,0,0,.12)] px-4 py-9 text-center sm:px-5">
      <p className="text-sm font-medium text-white/70">{title}</p>

      <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-white/35">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="
          mt-4 rounded-xl border border-white/[.12]
          bg-white/[.045] px-4 py-2.5 text-xs
          font-semibold text-white/80
          shadow-[0_4px_12px_rgba(0,0,0,.12)]
          transition hover:border-white/[.16]
          hover:bg-white/[.06] hover:text-white
        "
      >
        {actionLabel}
      </button>
    </div>
  );
}
