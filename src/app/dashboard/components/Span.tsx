import React from "react";
import { AgentSpan } from "../api/testSamples/route";
import MarkdownRenderer from "./MarkdownRenderer";

export default function Span({ span, isHighlighted, highlightedText }: { span: AgentSpan; isHighlighted: boolean; highlightedText: string | null }) {
  const outputMessage = span.messages[span.messages.length - 1];

  return (
    <div
      className={`relative mx-1 bg-white overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm group hover:shadow-md ${
        isHighlighted ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="py-2 px-4 bg-background text-left">
        <h3 className="text-md font-bold">{span.name}</h3>
        <div className="text-sm text-muted-foreground">
          <MarkdownRenderer content={outputMessage.content} isHighlighted={isHighlighted} highlightedText={highlightedText} />
        </div>
      </div>
    </div>
  );
}
