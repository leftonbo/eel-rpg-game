/// <reference types="vite/client" />

declare module '*.md' {
  const attributes: Record<string, unknown>;
  const raw: string;
  export { attributes, raw };
}