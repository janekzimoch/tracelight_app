import React, { useRef, useEffect, useCallback } from "react";
import { AgentSpan } from "../page";
import { Avatar } from "@/components/ui/avatar";
import Span from "./Span";

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

  return (
    <div className="flex flex-col py-4 h-full w-full space-y-4">
      {spans.map((span) => (
        <div key={span.id} className="relative items-center" ref={setSpanRef(span.id)}>
          <Avatar className="absolute left-0 top-1/2 -translate-y-1/2 pointer-default border items-center justify-center text-slate-500 flex-none">
            {span.sequence_index + 1}
          </Avatar>
          <div className="pl-12">
            <Span span={span} isHighlighted={span.id === highlightedSpanId} highlightedText={highlightedText} />
          </div>
        </div>
      ))}
    </div>
  );
}
