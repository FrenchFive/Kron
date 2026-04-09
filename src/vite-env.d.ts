/// <reference types="vite/client" />

declare module '@mozilla/readability' {
  export class Readability {
    constructor(doc: Document, options?: Record<string, unknown>);
    parse(): { title: string; content: string; textContent: string; byline: string; excerpt: string } | null;
  }
}

declare module 'mammoth' {
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}
