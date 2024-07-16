import React from "react";
import { Button } from "@/components/ui/button";
import TestSampleCard from "./components/TestSampleCard";

export interface TestSample {
  id: number;
  userIntent: string;
  subIntents: string[];
  trace: string[];
  results: string;
  explanation: string;
}

const testSamples: TestSample[] = [
  {
    id: 1,
    userIntent: "Send an email to John Doe with subject 'Meeting' and...",
    subIntents: ["Send email", "Fetch emails"],
    trace: ["1", "2", "3", "4"],
    results: "",
    explanation: "",
  },
  {
    id: 2,
    userIntent: "Schedule a meeting with the team at 3 PM...",
    subIntents: ["Schedule meeting", "Check calendar"],
    trace: ["1", "2", "3"],
    results: "",
    explanation: "",
  },
  // Add more sample data here...
];

export default function TestSamples() {
  return (
    <div className="flex items-start h-screen mt-24">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center px-4">
            <div className="mr-8 w-8"></div>
            <div className="flex-1 relative mb-4">
              <div className="grid grid-cols-5 gap-4 text-center">
                <h3 className="text-sm font-medium text-slate-500">User Intent</h3>
                <h3 className="text-sm font-medium text-slate-500">Traces</h3>
                <h3 className="text-sm font-medium text-slate-500">Milestones</h3>
                <h3 className="text-sm font-medium text-slate-500">Tests</h3>
                <h3 className="text-sm font-medium text-slate-500">Results</h3>
              </div>
              <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-5 pointer-events-none">
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
              </div>
            </div>
            <div className="w-10"></div>
          </div>
          {testSamples.map((sample, index) => (
            <TestSampleCard sample={sample} index={index} />
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex justify-center mt-4">
            <Button variant="outline">Run Tests</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
