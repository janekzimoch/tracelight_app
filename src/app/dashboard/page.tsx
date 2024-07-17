"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TestSampleCard from "./components/TestSampleCard";

export interface SpanType {
  id: string;
  sequence_index: number;
  role: string;
  content: string;
  tool_calls: string | null;
}

export interface Trace {
  trace_id: string;
  spans: SpanType[];
}

export default function TestSamples() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTraces() {
      try {
        const response = await fetch("/dashboard/api/traces");
        if (response.ok) {
          const data = await response.json();
          const samples = Object.entries(data).map(([trace_id, spans]) => ({
            trace_id,
            spans: spans as SpanType[],
          }));
          console.log("samples:", samples);
          setTraces(samples);
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
              <div className="grid grid-cols-5 gap-4 text-center text-md text-muted-foreground">
                <h3>User Intent</h3>
                <h3>Traces</h3>
                <h3>Milestones</h3>
                <h3>Tests</h3>
                <h3>Results</h3>
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
          {traces.map((trace, index) => (
            <TestSampleCard key={trace.trace_id} trace={trace} index={index} />
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
