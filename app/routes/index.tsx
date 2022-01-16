import { marked } from "marked";
import { useCallback, useMemo, useRef, useState } from "react";
import { LoaderFunction, useFetcher, useLoaderData } from "remix";
import { DefaultData, getDefaultData } from "~/getFileContents";
import baseStyles from "../styles/baseStyles.css";

export const loader: LoaderFunction = () => {
  return getDefaultData();
};

export const links = () => {
  return [{ rel: "stylesheet", href: baseStyles }];
};

export default function Index() {
  const {
    markdown: initialMarkdown,
    css: initialCss,
    markdownAsHtml: initialMarkdownAsHtml,
  } = useLoaderData<DefaultData>();
  const [css, setCss] = useState<string>(initialCss);
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [editingMarkdown, setEditingMarkdown] = useState(false);
  const cssInputRef = useRef<HTMLTextAreaElement | null>(null);
  const markdownInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [columnsToShow, setColumnsToShow] = useState<{
    markdown: boolean;
    css: boolean;
    htmlRaw: boolean;
  }>({ markdown: true, css: true, htmlRaw: false });

  const fetcher = useFetcher();
  const fetcherMarkdown = useFetcher();

  const updateCss = useCallback(() => {
    const css = cssInputRef?.current?.value;
    if (!css) return;
    setCss(css);

    fetcher.submit(
      { css: `.markdown { ${css} }` },
      { method: "post", action: "/sassify" }
    );
  }, [setCss, fetcher]);

  const updateMarkdown = useCallback(() => {
    setEditingMarkdown((prev) => !prev);
    if (!editingMarkdown) {
      return;
    }

    const markdown = markdownInputRef?.current?.value;
    if (!markdown) return;
    setMarkdown(markdown);

    fetcherMarkdown.submit(
      { markdown },
      { method: "post", action: "/updateMarkdown" }
    );
  }, [fetcher, editingMarkdown, setEditingMarkdown]);

  return (
    <main className="container">
      <style type="text/css" scoped>{`${
        fetcher.data?.css ?? initialCss
      }`}</style>

      <div className="row">
        <input
          type="checkbox"
          onClick={() =>
            setColumnsToShow((prev) => ({ ...prev, markdown: !prev.markdown }))
          }
          id="show_markdown"
          checked={columnsToShow.markdown}
        />
        <label htmlFor="show_markdown">Show Markdown</label>

        <input
          type="checkbox"
          onClick={() =>
            setColumnsToShow((prev) => ({ ...prev, htmlRaw: !prev.htmlRaw }))
          }
          id="show_htmlRaw"
          checked={columnsToShow.htmlRaw}
        />
        <label htmlFor="show_htmlRaw">Show Raw Html</label>

        <input
          type="checkbox"
          onClick={() =>
            setColumnsToShow((prev) => ({ ...prev, css: !prev.css }))
          }
          id="show_css"
          checked={columnsToShow.css}
        />
        <label htmlFor="show_css">Show css</label>
      </div>
      <div className="row scrollable grow">
        {columnsToShow.markdown && (
          <div className="column grow">
            <button onClick={updateMarkdown}>Edit Markdown</button>
            {editingMarkdown ? (
              <textarea
                className="grow"
                placeholder="Enter your markdown here"
                ref={markdownInputRef}
                defaultValue={markdown}
              />
            ) : (
              <div
                className="markdown scrollable grow"
                dangerouslySetInnerHTML={{
                  __html:
                    fetcherMarkdown.data?.markdown ?? initialMarkdownAsHtml,
                }}
              />
            )}
          </div>
        )}
        {columnsToShow.htmlRaw && (
          <div className="column grow">
            <div placeholder="Enter your css here">
              {fetcherMarkdown.data?.markdown ?? initialMarkdownAsHtml}
            </div>
          </div>
        )}
        {columnsToShow.css && (
          <div className="column grow">
            <button onClick={updateCss}>Update Css</button>
            <textarea
              placeholder="Enter your css here"
              ref={cssInputRef}
              defaultValue={css}
            />
          </div>
        )}
      </div>
    </main>
  );
}
