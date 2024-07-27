import React, { useState } from "react";
import { MessageSpan } from "../api/testSamples/route";
import MarkdownRenderer from "./MarkdownRenderer";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

export default function SubSpan({ message }: { message: MessageSpan }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="relative mx-1 my-1 bg-slate-50 overflow-hidden border border-solid rounded-lg shadow-sm group cursor-pointer"
      onClick={toggleExpand}
    >
      <div className="py-2 px-4 bg-background text-left">
        <h3 className="text-sm font-semibold">{message.type}</h3>
        <div
          className={`text-xs text-muted-foreground transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[150px]" : "max-h-0"
          } overflow-y-auto`}
        >
          <MarkdownRenderer content={message.content} />
        </div>
      </div>
      <div className="absolute top-2 right-2 text-xs text-muted-foreground">{isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
    </div>
  );
}
