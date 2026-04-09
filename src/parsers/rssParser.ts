import Parser from 'rss-parser';

export interface RssArticle {
  title: string;
  link: string;
  contentSnippet: string;
  pubDate: string;
  content?: string;
}

const parser = new Parser();

export async function parseRssFeed(url: string): Promise<{
  feedTitle: string;
  articles: RssArticle[];
}> {
  const feed = await parser.parseURL(url);

  const articles: RssArticle[] = (feed.items ?? []).map(item => ({
    title: item.title ?? 'Untitled',
    link: item.link ?? '',
    contentSnippet: item.contentSnippet ?? '',
    pubDate: item.pubDate ?? item.isoDate ?? '',
    content: item.content,
  }));

  return {
    feedTitle: feed.title ?? 'Untitled Feed',
    articles,
  };
}
