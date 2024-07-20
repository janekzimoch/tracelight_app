"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TestSampleCard from "./components/TestSampleCard";
import { ResultStatus } from "./components/ResultBar";
import { Milestones } from "./components/MilestoneTextField";

export interface SpanType {
  id: string;
  sequence_index: number;
  role: string;
  content: string;
  tool_calls: string | null;
}

export interface Trace {
  trace_id: string;
  user_request: string;
  spans: SpanType[];
}

const resultMockData: ResultStatus[] = [
  { numberPassed: 5, numberTotal: 5 },
  { numberPassed: 4, numberTotal: 5 },
];

const milestonesMockData: Milestones[] = [
  [
    "Make sure emails are under 50 words long.",
    "Planner should plan 4 steps: 1) find user email address, 2) find recipeint email address, 3) fetch relevant data, 4) send email.",
    "email was sent succesfully if we get 200 response from gmail",
    "make sure get_email_address gets called for both user and recipient",
  ],
  [
    "Ensure email subjects are concise and informative.",
    "The planner should execute the following steps: 1) authenticate user, 2) verify recipient details, 3) compose email content, 4) deliver email.",
    "An email is considered sent successfully if a 200 status code is returned by the mail server.",
    "Verify that get_user_email and get_recipient_email functions are executed for both sender and recipient.",
  ],
];

export default function TestSamples() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTraces() {
      try {
        const response = await fetch("/dashboard/api/traces");
        if (response.ok) {
          const data: Trace[] = await response.json();
          setTraces(data);
        } else {
          console.error("Failed to fetch traces");
        }
      } catch (error) {
        console.error("Error fetching traces:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTraces();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-start h-screen mt-24">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center px-4">
            <div className="mr-8 w-8"></div>
            <div className="flex-1 relative mb-4">
              <div className="grid grid-cols-4 gap-4 text-center text-md text-muted-foreground">
                <h3>User Intent</h3>
                <h3>Traces</h3>
                <h3>Milestones</h3>
                <h3>Results</h3>
              </div>
              <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-4 pointer-events-none">
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
              </div>
            </div>
            <div className="w-10"></div>
          </div>
          {traces.map((trace, index) => (
            <TestSampleCard key={trace.trace_id} trace={trace} index={index} result={resultMockData[index]} milestones={milestonesMockData[index]} />
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
