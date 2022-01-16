import path from "path";
import fs from "fs/promises";
import { convertMarkdownToHtml } from "./updateMarkdownFn";

const assetsPath = path.join(__dirname, "..", "assets");

const defaultMarkdownPath = path.join(assetsPath, 'defaultMarkdown.md');
const defaultCssPath = path.join(assetsPath, 'defaultCss.css');

export interface DefaultData {
  markdown: string;
  markdownAsHtml: string;
  css: string;
}

export async function getDefaultData(): Promise<DefaultData> {
  const [markdown, css] = await Promise.all([fs.readFile(defaultMarkdownPath), fs.readFile(defaultCssPath)]);

  return {
    markdown: markdown.toString(),
    markdownAsHtml: convertMarkdownToHtml(markdown.toString()) ?? '',
    css: css.toString(),
  }
}