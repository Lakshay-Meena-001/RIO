import { PDFParse } from "pdf-parse";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE_MB = Number(process.env.RESUME_MAX_FILE_SIZE_MB ?? 10);

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

if (!Number.isFinite(MAX_FILE_SIZE_MB) || MAX_FILE_SIZE_MB <= 0) {
  throw new Error("RESUME_MAX_FILE_SIZE_MB must be a positive number.");
}

export const extractText = async (filePath) => {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw new TypeError("A valid PDF file path is required.");
  }

  const resolvedPath = path.resolve(filePath);
  let parser;

  try {
    const fileBuffer = await fs.readFile(resolvedPath);

    if (fileBuffer.length === 0) {
      const error = new Error("The uploaded PDF file is empty.");
      error.code = "PDF_EMPTY";
      throw error;
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      const error = new Error(
        "The PDF file exceeds the configured size limit.",
      );
      error.code = "PDF_TOO_LARGE";
      throw error;
    }

    // Basic file-signature check. A .pdf extension alone is not enough.
    const pdfSignature = fileBuffer.subarray(0, 5).toString("ascii");

    if (pdfSignature !== "%PDF-") {
      const error = new Error("The uploaded file is not a valid PDF.");
      error.code = "INVALID_PDF";
      throw error;
    }

    parser = new PDFParse({ data: fileBuffer });

    const result = await parser.getText();
    const extractedText =
      typeof result?.text === "string" ? result.text.trim() : "";

    if (!extractedText) {
      const error = new Error(
        "No readable text was found in the PDF. Scanned PDFs may require OCR.",
      );

      error.code = "PDF_NO_READABLE_TEXT";
      throw error;
    }

    return extractedText;
  } catch (error) {
    if (error?.code) {
      throw error;
    }

    console.error("[Resume PDF] Text extraction failed:", {
      message: error?.message,
    });

    const extractionError = new Error(
      "Unable to read this PDF. Please upload a valid, text-readable PDF.",
    );

    extractionError.code = "PDF_EXTRACTION_FAILED";
    throw extractionError;
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (cleanupError) {
        console.warn("[Resume PDF] Parser cleanup failed:", {
          message: cleanupError?.message,
        });
      }
    }
  }
};

export default extractText;
