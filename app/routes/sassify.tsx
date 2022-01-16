import { ActionFunction, json } from "remix";
import { sassify } from "~/sassifyFn";

export const action: ActionFunction = async ({ request }) => {
  const css = (await request.formData()).get("css");
  if (!css || typeof css !== "string") return json({ css: null });
  const str = sassify(css);
  return json({ css: str });
};
