import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type FeedbackProps = {
  title: string;
  message: string; // Can contain placeholders like {ref0}, {ref1}, etc.
  references: Array<{
    spanId: string;
    text: string;
  }>;
};

export default function TestSampleExplenations({
  feedback,
  onReferenceClick,
}: {
  feedback: FeedbackProps[];
  onReferenceClick: (spanId: string, text: string) => void;
}) {
  const renderMessageWithReferences = (message: string, references: Array<{ spanId: string; text: string }>) => {
    return message.split(/(\{ref\d+\})/g).map((part, index) => {
      const match = part.match(/\{ref(\d+)\}/);
      if (match) {
        const refIndex = parseInt(match[1], 10);
        const reference = references[refIndex];
        if (reference) {
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReferenceClick(reference.spanId, reference.text)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{reference.text}</p>
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
      {feedback.map((fb, index) => (
        <div key={index} className="bg-green-200 border border-green-500 py-2 px-4 mx-1 rounded-md text-left shadow">
          <h3 className="text-md font-bold">{fb.title}</h3>
          <p className="text-sm">{renderMessageWithReferences(fb.message, fb.references)}</p>
        </div>
      ))}
    </div>
  );
}
