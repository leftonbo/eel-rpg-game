/// <reference types="vite/client" />

declare module '*.md' {
  const attributes: Record<string, any>;
  const html: string;
  const markdown: string;
  export { attributes, html, markdown };
}