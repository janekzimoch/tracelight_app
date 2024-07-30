import React, { useRef, useEffect, useCallback, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import Span from "./Span";
import { AgentSpan } from "../api/testSamples/route";
import SubSpan from "./SubSpan";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

export default function TestSampleSpans({
  spans,
  highlightedSpanId,
  highlightedText,
}: {
  spans: AgentSpan[];
  highlightedSpanId: string | null;
  highlightedText: string | null;
}) {
  const spanRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [expandedSpans, setExpandedSpans] = useState<{ [key: string]: boolean }>({});

  const setSpanRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      spanRefs.current[id] = el;
    },
    []
  );

  useEffect(() => {
    if (highlightedSpanId && spanRefs.current[highlightedSpanId]) {
      spanRefs.current[highlightedSpanId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedSpanId]);

  const toggleExpand = (spanId: string) => {
    setExpandedSpans((prev) => ({
      ...prev,
      [spanId]: !prev[spanId],
    }));
  };

  return (
    <div className="flex flex-col py-4 h-full w-full space-y-4">
      {spans.map((span) => (
        <div key={span.id}>
          <div className="relative items-center cursor-pointer" ref={setSpanRef(span.id)} onClick={() => toggleExpand(span.id)}>
            <Avatar className="absolute left-0 top-1/2 -translate-y-1/2 pointer-default border items-center justify-center text-slate-500 flex-none">
              {span.sequence_index + 1}
            </Avatar>
            <div className="pl-12">
              <Span span={span} isHighlighted={span.id === highlightedSpanId} highlightedText={highlightedText} />
            </div>
            <div className="absolute top-3 right-3 text-muted-foreground chevron-hover">
              {expandedSpans[span.id] ? <ChevronUpIcon width={18} height={18} /> : <ChevronDownIcon width={18} height={18} />}
            </div>
          </div>
          {expandedSpans[span.id] && (
            <div className="mt-2 pl-20 transition-all duration-300 ease-in-out">
              {span.messages.map((message, index) => (
                <div key={index}>
                  <SubSpan message={message} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
