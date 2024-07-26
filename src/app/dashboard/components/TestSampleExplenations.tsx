import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SpanReference, TestResult } from "../api/testSamples/route";

export default function TestSampleExplanations({
  feedback,
  onReferenceClick,
}: {
  feedback: (TestResult | null)[];
  onReferenceClick: (spanId: string, text: string) => void;
}) {
  const renderMessageWithReferences = (message: string, references: SpanReference[], pass: boolean) => {
    return message.split(/(\{ref\d+\})/g).map((part, index) => {
      const match = part.match(/\{ref(\d+)\}/);
      if (match) {
        const refIndex = parseInt(match[1], 10);
        const reference = references[refIndex];
        console.log("reference.id:", reference.id);
        if (reference) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReferenceClick(reference.agent_span_id, reference.reference_text)}
                    className={`inline-flex items-center ${pass ? "text-green-300 hover:text-green-600" : "text-red-300 hover:text-red-600"}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{reference.reference_text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }
      return part;
    });
  };
  return (
    <div className="py-4 space-y-2">
      {feedback
        .filter((fb): fb is TestResult => fb !== null)
        .map((fb, index) => (
          <div
            key={index}
            className={`${
              fb.pass ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800"
            } border py-2 px-4 mx-1 rounded-md text-left shadow`}
          >
            <h3 className="text-md font-bold">{fb.test_title}</h3>
            <p className="text-sm">{renderMessageWithReferences(fb.feedback_message, fb.span_references, fb.pass)}</p>
          </div>
        ))}
    </div>
  );
}
