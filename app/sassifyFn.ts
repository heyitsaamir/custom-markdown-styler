import { compileString } from "sass";

export function sassify(css: string): string | null {
  try {
    const res = compileString(css).css;
    return res;
  } catch (error) {
    console.error(error);
    return 'foo';
  }
};