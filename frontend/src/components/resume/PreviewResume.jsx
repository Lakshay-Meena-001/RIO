import React, { useEffect, useRef, useState } from "react";

import BasicTemplate from "./templates/BasicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";

const templates = {
  basic: {
    label: "Basic",
    mobileLabel: "Basic",
    component: BasicTemplate,
  },
  modern: {
    label: "Modern",
    mobileLabel: "Modern",
    component: ModernTemplate,
  },
  professional: {
    label: "Professional",
    mobileLabel: "Pro",
    component: ProfessionalTemplate,
  },
};

export default function PreviewResume({
  data,
  selectedTemplate = "basic",
  onTemplateChange,
  onClose,
  onDownload,
}) {
  const activeTemplate = templates[selectedTemplate] || templates.basic;
  const TemplateComponent = activeTemplate.component;

  const resumeRef = useRef(null);
  // zoom = 1 means "fit the complete A4 sheet in the available preview area".
  // Values above 1 intentionally zoom beyond the fitted size.
  const [zoom, setZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewViewportRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: 700,
  });
  const [paperSize, setPaperSize] = useState({
    width: 794,
    height: 1122,
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updatePreviewSize = () => {
      setPreviewSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updatePreviewSize();

    const observer = new ResizeObserver(updatePreviewSize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const paper = resumeRef.current;
    if (!paper) return;

    const updatePaperSize = () => {
      setPaperSize({
        width: paper.scrollWidth || 794,
        height: paper.scrollHeight || 1122,
      });
    };

    updatePaperSize();

    const observer = new ResizeObserver(updatePaperSize);
    observer.observe(paper);

    return () => observer.disconnect();
  }, [data, selectedTemplate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const changeZoom = (amount) => {
    setZoom((current) =>
      Math.min(2.5, Math.max(1, Number((current + amount).toFixed(2))))
    );
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);

      if (typeof onDownload === "function") {
        await onDownload();
        return;
      }

      const resumeElement = resumeRef.current;

      if (!resumeElement) {
        throw new Error("Resume preview is not ready.");
      }

      /*
       * IMPORTANT:
       * Do not call window.print() here.
       *
       * The preview lives inside a large dashboard/modal layout. Printing the
       * whole document makes Chrome calculate the dashboard's hidden/scroll
       * layout and can produce 5–6 sheets even when the resume itself is one
       * page.
       *
       * Instead, create a temporary print iframe containing ONLY the selected
       * resume. The browser then paginates only the A4 document.
       */
      const iframe = document.createElement("iframe");

      iframe.setAttribute("aria-hidden", "true");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.opacity = "0";

      document.body.appendChild(iframe);

      const printDocument = iframe.contentDocument;
      const printWindow = iframe.contentWindow;

      if (!printDocument || !printWindow) {
        iframe.remove();
        throw new Error("Unable to prepare PDF preview.");
      }

      // Copy the application's CSS so Tailwind/template classes render
      // exactly like the resume preview.
      document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((node) => {
          printDocument.head.appendChild(node.cloneNode(true));
        });

      const printStyle = printDocument.createElement("style");

      printStyle.textContent = `
        @page {
          size: A4;
          margin: 0;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          min-width: 210mm !important;
          background: #fff !important;
          overflow: visible !important;
        }

        body {
          display: block !important;
        }

        #resume-print-root {
          width: 210mm !important;
          max-width: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          overflow: visible !important;
        }

        #resume-print-root > * {
          width: 210mm !important;
          max-width: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          box-shadow: none !important;
          overflow: visible !important;
        }

        #resume-print-root * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;

      printDocument.head.appendChild(printStyle);

      const root = printDocument.createElement("div");
      root.id = "resume-print-root";

      // Clone ONLY the A4 resume, never the preview bars or dashboard.
      const clone = resumeElement.cloneNode(true);

      clone.removeAttribute("style");
      clone.style.width = "210mm";
      clone.style.maxWidth = "210mm";
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.transform = "none";
      clone.style.boxShadow = "none";
      clone.style.background = "#fff";

      root.appendChild(clone);
      printDocument.body.appendChild(root);

      // Give external styles/fonts a chance to load before Chrome creates
      // the print layout.
      const waitForResources = async () => {
        if (printDocument.fonts?.ready) {
          await printDocument.fonts.ready;
        }

        const images = Array.from(printDocument.images);

        await Promise.all(
          images.map(
            (image) =>
              image.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    image.onload = resolve;
                    image.onerror = resolve;
                  })
          )
        );

        await new Promise((resolve) =>
          printWindow.requestAnimationFrame(() =>
            printWindow.requestAnimationFrame(resolve)
          )
        );
      };

      await waitForResources();

      const cleanup = () => {
        setTimeout(() => {
          iframe.remove();
        }, 300);
      };

      printWindow.addEventListener("afterprint", cleanup, { once: true });

      printWindow.focus();
      printWindow.print();

      // Some Chromium versions do not reliably fire afterprint on a hidden
      // iframe, so also clean it up after the print dialog has been opened.
      setTimeout(cleanup, 1500);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
          }

          /* Print ONLY the selected resume. All preview controls disappear. */
          .resume-preview-overlay > * {
            display: none !important;
          }

          .resume-preview-overlay > .resume-preview-viewport {
            display: block !important;
            position: static !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .resume-print-stage {
            display: block !important;
            position: static !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .resume-print-paper {
            display: block !important;
            position: static !important;
            width: 210mm !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .resume-print-paper * {
            visibility: visible !important;
          }
        }
      `}</style>

    <div
      className="resume-preview-overlay fixed inset-0 z-[100] flex w-screen max-w-none min-w-0 flex-col bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
    >
      {/* ============================ TOP BAR ============================== */}
      <div
        className="
          relative z-[105] flex shrink-0 items-center
          border-b border-white/[0.12]
          bg-white/[0.055]
          px-4 py-3
          shadow-[0_8px_30px_rgba(0,0,0,0.18)]
          backdrop-blur-2xl
          sm:px-5 sm:py-3.5
        "
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-[-0.01em] text-white sm:text-[15px]">
            Resume Preview
          </p>
          <p className="mt-0.5 text-[11px] text-white/40 sm:text-xs">
            {activeTemplate.label} template
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close resume preview"
          className="
            inline-flex h-9 w-9 shrink-0 items-center justify-center
            rounded-xl
            border border-white/[0.14]
            bg-white/[0.07]
            text-xl leading-none text-white/75
            shadow-[0_4px_18px_rgba(0,0,0,0.18)]
            backdrop-blur-xl
            transition-all duration-200
            hover:border-white/[0.22]
            hover:bg-white/[0.12]
            hover:text-white
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-white/40
          "
        >
          ×
        </button>
      </div>

      {/* ========================= DESKTOP CONTROLS ======================== */}
      <div className="hidden shrink-0 items-center justify-center border-b border-white/10 bg-[#0b0b0f]/80 px-5 py-2.5 sm:flex">
        <div
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1"
          role="tablist"
          aria-label="Resume templates"
        >
          {Object.entries(templates).map(([templateKey, template]) => {
            const isActive = selectedTemplate === templateKey;

            return (
              <button
                key={templateKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTemplateChange?.(templateKey)}
                className={`
                  shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  ${
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }
                `}
              >
                {template.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="
            absolute right-16
            inline-flex items-center justify-center rounded-lg
            border border-white/15 bg-white/[0.06]
            px-3 py-2 text-xs font-medium text-white
            transition hover:bg-white/[0.12]
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {isDownloading ? "Preparing..." : "Download PDF"}
        </button>
      </div>

      {/* ============================ PREVIEW ============================== */}
      <div
        ref={previewViewportRef}
        className={`
          resume-preview-viewport
          min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain
          ${zoom > 1 ? "overflow-x-auto" : "overflow-x-hidden"}
          bg-black/30 px-3 py-5 sm:px-6 sm:py-8 lg:px-10
          pb-[150px] sm:pb-10 isolate
        `}
      >
        {(() => {
          // A4 starts at its natural browser-rendered size and is scaled down
          // ONLY enough to make the complete sheet visible initially.
          // On mobile, always fit the A4 sheet inside the actual viewport width
          // at the default 100% zoom. Horizontal scrolling should only become
          // necessary after the user explicitly zooms in.
          const horizontalPadding = previewSize.width < 640 ? 24 : 48;
          const horizontalFit = Math.max(
            0.1,
            (previewSize.width - horizontalPadding) / paperSize.width
          );

          const verticalFit = Math.max(
            0.1,
            (previewSize.height - (previewSize.width < 640 ? 24 : 48)) /
              paperSize.height
          );

          const fitScale = Math.min(1, horizontalFit, verticalFit);
          const actualScale = fitScale * zoom;

          const scaledWidth = paperSize.width * actualScale;
          const scaledHeight = paperSize.height * actualScale;

          return (
            <div
              className="resume-print-stage resume-print-wrapper relative h-fit shrink-0"
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div
                ref={resumeRef}
                className="
                  resume-print-paper
                  resume-preview-paper
                  h-fit w-[210mm] max-w-none
                  origin-top-left
                  bg-white
                  shadow-[0_20px_80px_rgba(0,0,0,0.55)]
                "
                style={{
                  transform: `scale(${actualScale})`,
                }}
              >
                <TemplateComponent data={data} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* ========================== DESKTOP ZOOM =========================== */}
      <div className="hidden shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-[#0b0b0f]/90 px-3 py-2 sm:flex">
        <button
          type="button"
          onClick={() => changeZoom(-0.05)}
          className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
          aria-label="Zoom out"
        >
          −
        </button>

        <span className="min-w-[52px] text-center text-xs text-white/55">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => changeZoom(0.05)}
          className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {/* ============================ MOBILE BOTTOM ======================== */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-[110]
          border-t border-white/10
          bg-[#0b0b0f]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
          pt-2 backdrop-blur-xl sm:hidden
        "
      >
        {/* Mobile zoom controls */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => changeZoom(-0.05)}
            className="
              h-9 w-10 rounded-lg
              border border-white/10 bg-white/[0.05]
              text-base font-medium text-white/80
              transition hover:bg-white/[0.1]
              active:scale-[0.97]
            "
            aria-label="Zoom out"
          >
            −
          </button>

          <span className="min-w-[56px] text-center text-xs font-medium text-white/55">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => changeZoom(0.05)}
            className="
              h-9 w-10 rounded-lg
              border border-white/10 bg-white/[0.05]
              text-base font-medium text-white/80
              transition hover:bg-white/[0.1]
              active:scale-[0.97]
            "
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Template container */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(templates).map(([templateKey, template]) => {
              const isActive = selectedTemplate === templateKey;

              return (
                <button
                  key={templateKey}
                  type="button"
                  onClick={() => onTemplateChange?.(templateKey)}
                  aria-pressed={isActive}
                  className={`
                    rounded-lg px-2 py-2.5 text-xs font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                    }
                  `}
                >
                  {template.mobileLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Download container */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="
            mt-2 flex w-full items-center justify-center
            rounded-xl bg-white px-4 py-3
            text-xs font-semibold text-black
            transition active:scale-[0.99]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isDownloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>
    </div>
    </>
  );
}
