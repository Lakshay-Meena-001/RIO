import React from "react";
import { useReactToPrint } from "react-to-print";

export default function DownloadResume({
  resumeRef,
  fileName = "RIO-Resume",
  className = "",
  children = "Download PDF",
}) {
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,

    documentTitle: fileName,

    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .resume-page {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        .break-inside-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      }
    `,

    onBeforePrint: async () => {
      document.body.classList.add("rio-printing-resume");
    },

    onAfterPrint: () => {
      document.body.classList.remove("rio-printing-resume");
    },

    onPrintError: (errorLocation, error) => {
      console.error(`Resume PDF generation failed at ${errorLocation}:`, error);

      document.body.classList.remove("rio-printing-resume");
    },
  });

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        bg-white
        px-4
        py-2.5
        text-sm
        font-semibold
        text-black
        transition-all
        duration-200
        hover:bg-white/90
        active:scale-[0.98]
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-white/50
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}
