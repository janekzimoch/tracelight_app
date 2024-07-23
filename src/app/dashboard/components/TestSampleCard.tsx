"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { Trace } from "../page";
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import ResultBar, { ResultStatus } from "./ResultBar";
import { Milestones } from "./MilestoneCard";
import MilestoneModal from "./MilestoneModal";
import TestSampleSpans from "./TestSampleSpans";
import TestSampleExplenations, { FeedbackProps } from "./TestSampleExplenations";

export default function TestSampleCard({
  trace,
  result,
  index,
  milestones,
  updateMilestone,
  addMilestone,
  feedback,
}: {
  trace: Trace;
  result: ResultStatus;
  index: number;
  milestones: Milestones;
  updateMilestone: (subIndex: number, value: string) => void;
  addMilestone: (value: string) => void;
  feedback: FeedbackProps[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  const handleReferenceClick = (spanId: string, text: string) => {
    setHighlightedSpanId(spanId);
    setHighlightedText(text);
  };

  return (
    <Card
      key={trace.trace_id}
      className={`relative rounded-lg p-4 space-y-2 transition-all duration-300 ${
        expanded ? "max-h-[700px]" : "max-h-[200px]"
      } overflow-hidden group`}
    >
      <div className="flex items-center ">
        <Avatar className="mr-8 text-slate-500">
          <AvatarFallback>{index + 1}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-4 gap-6 ">
          <div className="border max-h-[160px] rounded-md shadow hover:shadow-md flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <p className="text-sm text-slate-900 p-2">{trace.user_request}</p>
            </div>
          </div>
          <div>
            <ul className="list-disc list-inside text-sm text-slate-900">Some Trace summary ....</ul>
          </div>
          <div>
            <MilestoneModal milestones={milestones} updateMilestone={updateMilestone} addMilestone={addMilestone} />
          </div>
          <div className="flex justify-center items-center">
            <ResultBar result={result} />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-red-500">
          <TrashIcon width="20" height="20" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className={`h-4 -mb-3 px-[45%] transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {expanded ? <ChevronUpIcon className="w-5 h-5 text-muted-foreground" /> : <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />}
        </Button>
      </div>
      {expanded && (
        <div>
          <div className="border-t w-[90%] mx-auto my-4"></div>

          <div className="relative bg-slate-50 shadow-sm rounded-md py-4">
            <div className="grid px-10 grid-cols-2 gap-6  text-center pb-2 text-md text-muted-foreground">
              <div className="flex flex-col overflow-visible relative">
                <div className="text-center pb-2 pl-12 text-md text-muted-foreground">Spans</div>
                <div className="overflow-y-auto h-[400px] no-scrollbar">
                  <TestSampleSpans trace={trace} highlightedSpanId={highlightedSpanId} highlightedText={highlightedText} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-center pb-2 text-md text-muted-foreground">Results Explanation</div>
                <div className="overflow-y-auto h-[400px] no-scrollbar">
                  <TestSampleExplenations feedback={feedback} onReferenceClick={handleReferenceClick} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
