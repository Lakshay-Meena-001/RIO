import fs from "fs";
import { PDFParse } from "pdf-parse";

const extractText = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);

    const pdf = new PDFParse({
      data: buffer,
    });

    const result = await pdf.getText();

    return result.text;
  } finally {
    // PDFParse resources ko release karna
  }
};

export default extractText;
