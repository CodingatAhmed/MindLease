export interface PdfParseResult {
  text: string;
  numpages: number;
  info: unknown;
  metadata: unknown;
  version: string;
}