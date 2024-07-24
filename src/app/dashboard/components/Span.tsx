import React from "react";
import { AgentSpan } from "../api/testSamples/route";

export default function Span({ span, isHighlighted, highlightedText }: { span: AgentSpan; isHighlighted: boolean; highlightedText: string | null }) {
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
  const outputMessage = span.messages[span.messages.length - 1];
  return (
    <div
      className={`relative mx-1 bg-white col-span-2 overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm group hover:shadow-md ${
        isHighlighted ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="py-2 px-4 bg-background text-left">
        <h3 className="text-md font-bold">{span.name}</h3>
        <p className="text-sm text-muted-foreground">
          {isHighlighted && highlightedText ? highlightContent(outputMessage.content, highlightedText) : outputMessage.content}
        </p>
      </div>
    </div>
  );
}
