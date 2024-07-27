import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
  isHighlighted?: boolean;
  highlightedText?: string | null;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isHighlighted = false, highlightedText = null }) => {
  const highlightContent = (text: string, highlight: string) => {
    if (!highlight) return text;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedHighlight})`, "gi");
    return text.replace(regex, '<span class="bg-yellow-300">$1</span>');
  };

  // Pre-process the content to handle escaped newlines while preserving intentional line breaks
  const processedContent = content
    .replace(/\\n/g, "\n")
    .replace(/\n\n+/g, "\n\n")
    .replace(/^\t/gm, "") // Remove leading tabs
    .trim();

  const finalContent = isHighlighted && highlightedText ? highlightContent(processedContent, highlightedText) : processedContent;

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" {...(props as ComponentPropsWithoutRef<typeof SyntaxHighlighter>)}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          ol: ({ node, ordered, ...props }: any) => <ol className="list-decimal pl-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="whitespace-pre-line" {...props} />,
        }}
      >
        {finalContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
