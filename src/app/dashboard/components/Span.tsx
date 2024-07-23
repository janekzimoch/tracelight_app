import React from "react";
import { SpanType } from "../page";

export default function Span({ span, isHighlighted, highlightedText }: { span: SpanType; isHighlighted: boolean; highlightedText: string | null }) {
  const highlightContent = (content: string, textToHighlight: string) => {
    if (!textToHighlight) return content;
    const parts = content.split(new RegExp(`(${textToHighlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === textToHighlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-300">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
      className={`relative bg-white col-span-2 overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm group hover:shadow-md ${
        isHighlighted ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="py-2 px-4 bg-background text-left">
        <h3 className="text-md font-bold">{span.role}</h3>
        <p className="text-sm text-muted-foreground">
          {isHighlighted && highlightedText ? highlightContent(span.content, highlightedText) : span.content}
        </p>
      </div>
    </div>
  );
}
