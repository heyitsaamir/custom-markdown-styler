import { marked } from "marked";
import createDOMPurify from "dompurify";
import JSDOM from 'jsdom';

const window = new JSDOM.JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

export function convertMarkdownToHtml(newMarkdown: string): string | null {
  try {
    const res = DOMPurify.sanitize(marked(newMarkdown));
    console.log(res)
    return res;
  } catch (error) {
    console.error(error);
    return 'foo';
  }
};