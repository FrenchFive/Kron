export interface RssArticle {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string;
  content?: string;
}

/**
 * Parse an RSS or Atom feed using fetch + the browser's built-in DOMParser.
 * No Node.js dependencies — works in browsers and Capacitor WebViews.
 */
export async function parseRssFeed(url: string): Promise<{
  feedTitle: string;
  articles: RssArticle[];
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch {
    throw new Error("Couldn't reach this feed URL. Check the link and try again.");
  } finally {
    clearTimeout(timeout);
  }

  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid RSS/Atom feed.');
  }

  // Detect feed type: RSS 2.0 vs Atom
  const isAtom = doc.documentElement.tagName === 'feed';

  if (isAtom) {
    return parseAtom(doc);
  }
  return parseRss(doc);
}

function parseRss(doc: Document): { feedTitle: string; articles: RssArticle[] } {
  const channel = doc.querySelector('channel');
  const feedTitle = channel?.querySelector(':scope > title')?.textContent?.trim() ?? 'Untitled Feed';

  const items = Array.from(doc.querySelectorAll('item'));
  const articles: RssArticle[] = items.map(item => {
    const content = item.querySelector('content\\:encoded')?.textContent
      ?? item.querySelector('description')?.textContent
      ?? '';

    return {
      title: item.querySelector('title')?.textContent?.trim() ?? 'Untitled',
      link: item.querySelector('link')?.textContent?.trim() ?? '',
      contentSnippet: stripHtml(content).slice(0, 300),
      pubDate: item.querySelector('pubDate')?.textContent?.trim() ?? '',
      content,
    };
  });

  return { feedTitle, articles };
}

function parseAtom(doc: Document): { feedTitle: string; articles: RssArticle[] } {
  const feedTitle = doc.querySelector('feed > title')?.textContent?.trim() ?? 'Untitled Feed';

  const entries = Array.from(doc.querySelectorAll('entry'));
  const articles: RssArticle[] = entries.map(entry => {
    const content = entry.querySelector('content')?.textContent
      ?? entry.querySelector('summary')?.textContent
      ?? '';

    const linkEl = entry.querySelector('link[rel="alternate"]') ?? entry.querySelector('link');
    const link = linkEl?.getAttribute('href') ?? '';

    return {
      title: entry.querySelector('title')?.textContent?.trim() ?? 'Untitled',
      link,
      contentSnippet: stripHtml(content).slice(0, 300),
      pubDate: entry.querySelector('published')?.textContent?.trim()
        ?? entry.querySelector('updated')?.textContent?.trim()
        ?? '',
      content,
    };
  });

  return { feedTitle, articles };
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.trim() ?? '';
}
