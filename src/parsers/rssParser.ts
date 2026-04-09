export interface RssArticle {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string;
  content?: string;
}

const FEED_ACCEPT_HEADER = [
  'application/atom+xml',
  'application/rss+xml',
  'application/xml',
  'text/xml',
  'text/plain;q=0.9',
  '*/*;q=0.8',
].join(', ');

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function stripMarkup(value: string): string {
  if (!value) return '';

  const doc = new DOMParser().parseFromString(value, 'text/html');
  return normalizeText(doc.body.textContent || value);
}

function getChildElements(parent: Element): Element[] {
  return Array.from(parent.children);
}

function matchesName(element: Element, expectedName: string): boolean {
  const expected = expectedName.toLowerCase();
  const localName = element.localName.toLowerCase();
  const tagName = element.tagName.toLowerCase();
  const qualifiedName = element.prefix
    ? `${element.prefix.toLowerCase()}:${localName}`
    : localName;

  return localName === expected || tagName === expected || qualifiedName === expected;
}

function findChild(parent: Element, names: string[]): Element | null {
  const normalizedNames = names.map((name) => name.toLowerCase());
  return getChildElements(parent).find((child) => normalizedNames.some((name) => matchesName(child, name))) ?? null;
}

function getChildText(parent: Element, names: string[]): string {
  return normalizeText(findChild(parent, names)?.textContent);
}

function getAtomLink(entry: Element): string {
  const links = getChildElements(entry).filter((child) => matchesName(child, 'link'));
  const preferred = links.find((link) => {
    const rel = link.getAttribute('rel');
    return rel === null || rel === '' || rel === 'alternate';
  }) ?? links[0];

  return normalizeText(preferred?.getAttribute('href') ?? '');
}

function parseRssItems(root: Element): RssArticle[] {
  return getChildElements(root)
    .filter((child) => matchesName(child, 'item'))
    .map((item) => {
      const rawContent = getChildText(item, ['content:encoded', 'description']);

      return {
        title: getChildText(item, ['title']) || 'Untitled',
        link: getChildText(item, ['link', 'guid']),
        contentSnippet: stripMarkup(getChildText(item, ['description', 'content:encoded'])),
        pubDate: getChildText(item, ['pubDate', 'date', 'published']),
        content: rawContent || undefined,
      };
    });
}

function parseAtomEntries(root: Element): RssArticle[] {
  return getChildElements(root)
    .filter((child) => matchesName(child, 'entry'))
    .map((entry) => {
      const rawContent = getChildText(entry, ['content', 'summary']);

      return {
        title: getChildText(entry, ['title']) || 'Untitled',
        link: getAtomLink(entry),
        contentSnippet: stripMarkup(rawContent),
        pubDate: getChildText(entry, ['updated', 'published']),
        content: rawContent || undefined,
      };
    });
}

export async function parseRssFeed(url: string): Promise<{
  feedTitle: string;
  articles: RssArticle[];
}> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: FEED_ACCEPT_HEADER,
      },
    });
  } catch {
    throw new Error("Couldn't reach this RSS feed. Check the URL and try again.");
  }

  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}.`);
  }

  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('This URL did not return a valid RSS or Atom feed.');
  }

  const root = doc.documentElement;
  if (!root) {
    throw new Error('This URL did not return a valid RSS or Atom feed.');
  }

  if (matchesName(root, 'feed')) {
    return {
      feedTitle: getChildText(root, ['title']) || 'Untitled Feed',
      articles: parseAtomEntries(root),
    };
  }

  const channel = findChild(root, ['channel']);
  const rssRoot = channel ?? root;
  const articles = parseRssItems(channel ?? root);
  if (articles.length > 0 || channel) {
    return {
      feedTitle: getChildText(rssRoot, ['title']) || 'Untitled Feed',
      articles,
    };
  }

  return {
    feedTitle: 'Untitled Feed',
    articles: [],
  };
}
