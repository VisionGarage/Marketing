"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import CopyButton from "./CopyButton";

// Permite <mark> (evidențiere căutare) și clase de bază, dar curăță restul HTML-ului.
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "className"],
  },
};

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-vg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          // Fiecare bloc de cod primește un buton „copiază".
          pre({ children }) {
            const code = extractText(children);
            return (
              <div className="code-block group">
                <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                  <CopyButton text={code} />
                </div>
                <pre>{children}</pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
