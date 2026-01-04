import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

export class PdfExtractionService {
  constructor(
    private extractorUrl =
      process.env.PDF_EXTRACTOR_URL || "http://localhost:8000/extract"
  ) {}

  async extractPDF(files: any[]) {

    const form = new FormData();

    for (const file of files) {
        form.append("files", fs.createReadStream(file.path), {
            filename: file.originalname,
            contentType: file.mimetype || "application/pdf",
        });
    }

    const r = await fetch(this.extractorUrl, {
        method: "POST",
        body: form as any,
        headers: form.getHeaders() as any,
    });

    const text = await r.text();
    
    if (!r.ok) throw new Error(`Extractor ${r.status}: ${text}`);

    return JSON.parse(text);
  }
}
