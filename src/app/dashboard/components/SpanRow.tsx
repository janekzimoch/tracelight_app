"use client";

import { SpanType } from "../page";
import MilestoneCell from "./Milestone";
import Span from "./Span";
import TestCell from "./Test";
import { Avatar } from "@/components/ui/avatar";
import React, { useState, useEffect } from "react";

export interface Test {
  id: string;
  executable_code: string;
  description: string;
}

export default function SpanRow({ span }: { span: SpanType }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const response = await fetch(`/dashboard/api/tests/span/${span.id}`);
        if (response.ok) {
          const data = await response.json();
          setTests(data);
        } else {
          console.error("Failed to fetch tests");
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTests();
  }, [span.id]);

  return (
    <div className="relative grid grid-cols-4 gap-6 ml-12">
      <Avatar className="absolute -left-16 top-1/2 -translate-y-5 border items-center justify-center text-slate-500">
        {span.sequence_index + 1}
      </Avatar>
      <Span span={span} />
      <MilestoneCell />
      {isLoading ? <div>Loading tests...</div> : <TestCell tests={tests} setTests={setTests} spanId={span.id} />}
    </div>
  );
}
