import { PDFParse } from "pdf-parse";
import { randomUUID } from "node:crypto";
import { uploadToPinecone } from "../utils/uploadToPinecone.js";

export const parsePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const uInt8ArrayData = new Uint8Array(req.file.buffer);
    const pdfData = new PDFParse({ data: uInt8ArrayData });
    const result = await pdfData.getText();

    // Map valid pages into Pinecone integrated inference records
    const chunks = result.pages
      .filter((page) => page.text && page.text.trim().length > 0)
      .map((page) => ({
        _id: randomUUID(),
        chunk_text: page.text.trim(),
        pageNumber: page.num,
      }));

    if (chunks.length === 0) {
      return res.status(400).json({ error: "No readable text found in PDF" });
    }

    await uploadToPinecone(chunks);

    return res.json({
      message: "PDF parsed and uploaded to Pinecone successfully",
      totalChunks: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error("PDF Parsing / Upload Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
