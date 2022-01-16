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

const BackgroundInput = ({
  initialColor,
  onUpdate,
  id,
}: {
  initialColor: string;
  onUpdate: (newColor: string) => void;
  id: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input type="text" defaultValue={initialColor} id={id} ref={inputRef} />
      <button
        id={id}
        onClick={() => {
          if (!inputRef.current?.value) return;
          console.log(inputRef.current.value);
          onUpdate(inputRef.current.value);
        }}
      >
        ✓
      </button>
    </>
  );
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
  const [settings, updateSettings] = useState<{
    markdown: boolean;
    css: boolean;
    htmlRaw: boolean;
    backgroundColor: string;
  }>({ markdown: true, css: true, htmlRaw: false, backgroundColor: "#fefefe" });

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
    <main
      className="container"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <style type="text/css" scoped>{`${
        fetcher.data?.css ?? initialCss
      }`}</style>

      <div className="row header">
        <div className="title">
          <h3>Markdown Style Customizer</h3>
          Easily customize your markdown using SASS or CSS
        </div>
        <div className="links">
          <a href="https://github.com/heyitsaamir/custom-markdown-styler">
            Github
          </a>
          <a href="https://aamirj.com">Aamir Jawaid</a>
        </div>
      </div>
      <div className="row toolbar">
        <input
          type="checkbox"
          onClick={() =>
            updateSettings((prev) => ({ ...prev, markdown: !prev.markdown }))
          }
          id="show_markdown"
          defaultChecked={settings.markdown}
        />
        <label htmlFor="show_markdown">Show Markdown</label>

        <input
          type="checkbox"
          onClick={() =>
            updateSettings((prev) => ({ ...prev, htmlRaw: !prev.htmlRaw }))
          }
          id="show_htmlRaw"
          defaultChecked={settings.htmlRaw}
        />
        <label htmlFor="show_htmlRaw">Show Raw Html</label>

        <input
          type="checkbox"
          onClick={() =>
            updateSettings((prev) => ({ ...prev, css: !prev.css }))
          }
          id="show_css"
          defaultChecked={settings.css}
        />
        <label htmlFor="show_css">Show css</label>

        <BackgroundInput
          initialColor={settings.backgroundColor}
          onUpdate={(color) =>
            updateSettings((prev) => ({ ...prev, backgroundColor: color }))
          }
          id="background-color"
        />
        <label htmlFor="background-color">Update background color</label>
      </div>
      <div className="row scrollable grow">
        {settings.markdown && (
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
        {settings.htmlRaw && (
          <div className="column grow raw-html scrollable">
            <pre>{fetcherMarkdown.data?.markdown ?? initialMarkdownAsHtml}</pre>
          </div>
        )}
        {settings.css && (
          <div className="column grow">
            <button onClick={updateCss}>Update CSS (or SASS)</button>
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
