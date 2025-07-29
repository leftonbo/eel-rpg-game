/**
 * TypeScript type definitions for Markdown imports
 * Vite plugin markdown support
 */

export interface LibraryDocumentMetadata {
  id: string;
  title: string;
  type: 'diary' | 'strategy' | 'reflection' | 'default';
  requiredExplorerLevel: number;
  requiredBossDefeats?: string[];
  requiredBossLosses?: string[];
}

declare module '*.md' {
  const attributes: LibraryDocumentMetadata;
  const html: string;
  const markdown: string;
  
  export { attributes, html, markdown };
}