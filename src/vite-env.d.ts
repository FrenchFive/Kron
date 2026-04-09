/// <reference types="vite/client" />

declare module '@mozilla/readability' {
  export class Readability {
    constructor(doc: Document, options?: Record<string, unknown>);
    parse(): { title: string; content: string; textContent: string; byline: string; excerpt: string } | null;
  }
}

declare module 'rss-parser' {
  interface Item {
    title?: string;
    link?: string;
    content?: string;
    contentSnippet?: string;
    pubDate?: string;
    isoDate?: string;
  }
  interface Feed {
    title?: string;
    description?: string;
    link?: string;
    items: Item[];
  }
  class Parser {
    parseURL(url: string): Promise<Feed>;
    parseString(xml: string): Promise<Feed>;
  }
  export = Parser;
}

declare module 'mammoth' {
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}
