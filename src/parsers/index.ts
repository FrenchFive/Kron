import type { DocumentRecord } from '@/db/database';

export type SourceType = DocumentRecord['sourceType'];

export function detectFileType(filename: string): SourceType | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, SourceType> = {
    'txt': 'txt',
    'epub': 'epub',
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'html': 'html',
    'htm': 'html',
    'md': 'md',
    'markdown': 'md',
  };
  return map[ext ?? ''] ?? null;
}

export const SUPPORTED_EXTENSIONS = ['txt', 'epub', 'pdf', 'docx', 'doc', 'html', 'htm', 'md', 'markdown'];
export const FILE_ACCEPT = '.txt,.epub,.pdf,.docx,.doc,.html,.htm,.md,.markdown';
