import { ActionFunction, json } from "remix";
import { convertMarkdownToHtml } from "~/updateMarkdownFn";

export const action: ActionFunction = async ({ request }) => {
  const markdown = (await request.formData()).get("markdown");
  if (!markdown || typeof markdown !== "string")
    return json({ markdown: "foo" });
  const str = convertMarkdownToHtml(markdown);
  return json({ markdown: str });
};
