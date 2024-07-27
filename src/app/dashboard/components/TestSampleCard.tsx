"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import ResultBar from "./ResultBar";
import MilestoneModal from "./MilestoneModal";
import TestSampleSpans from "./TestSampleSpans";
import TestSampleExplenations from "./TestSampleExplenations";
import { TestSample } from "../api/testSamples/route";

export default function TestSampleCard({
  testSample,
  index,
  updateMilestone,
  addMilestone,
  deleteMilestone,
}: {
  testSample: TestSample;
  index: number;
  updateMilestone: (milestoneId: string, newText: string) => Promise<void>;
  addMilestone: (text: string) => void;
  deleteMilestone: (milestoneId: string) => Promise<void>;
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
      key={testSample.test_sample_id}
      className={`relative rounded-lg p-4 space-y-2 transition-all duration-300 ${
        expanded ? "max-h-[700px]" : "max-h-[200px]"
      } overflow-hidden group`}
    >
      <div className="flex items-center ">
        <Avatar className="mr-8 text-slate-500">
          <AvatarFallback>{index + 1}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-4 gap-6 ">
          <div>
            <div className="border max-h-[160px] rounded-md shadow  flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <p className="text-sm text-slate-900 p-2">{testSample.user_request}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="border border-solid py-2 px-3 rounded-md shadow max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="space-y-1">
                {testSample.spans.map((span, index) => (
                  <div key={index} className="border border-solid bg-slate-100 border-slate-400 rounded-md text-sm truncate px-2 py-[1px]">
                    {index + 1}. {span.name.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <MilestoneModal
              milestones={testSample.milestones}
              updateMilestone={updateMilestone}
              addMilestone={addMilestone}
              deleteMilestone={deleteMilestone}
            />
          </div>
          <div className="flex justify-center items-center">
            <ResultBar testSample={testSample} />
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
            <div className="grid px-10 grid-cols-5 gap-4  text-center pb-2 text-md text-muted-foreground">
              <div className="flex flex-col col-span-3 overflow-visible relative">
                <div className="text-center pb-2 pl-12 text-md text-muted-foreground">Spans</div>
                <div className="overflow-y-auto h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <TestSampleSpans spans={testSample.spans} highlightedSpanId={highlightedSpanId} highlightedText={highlightedText} />
                </div>
              </div>
              <div className="flex flex-col col-span-2">
                <div className="text-center pb-2 text-md text-muted-foreground">Results Explanation</div>
                <div className="overflow-y-auto h-[400px] no-scrollbar">
                  <TestSampleExplenations
                    feedback={testSample.milestones.map((milestone) => milestone.test_result)}
                    onReferenceClick={handleReferenceClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
