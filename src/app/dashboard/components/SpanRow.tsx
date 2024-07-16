"use client";

import MilestoneCell from "./Milestone";
import Span from "./Span";
import TestCell from "./Test";
import { Avatar } from "@/components/ui/avatar";
import React, { useState } from "react";

export default function SpanRow({ item, index }: { item: { title: string; description: string; tests: string[] }; index: number }) {
  const [tests, setTests] = useState<string[]>(item.tests);

  return (
    <div className="relative grid grid-cols-4 gap-6 ml-12">
      <Avatar className="absolute -left-16 top-1/2 -translate-y-5 border items-center justify-center text-slate-500">{index + 1}</Avatar>
      <Span span={item} />
      <MilestoneCell />
      <TestCell tests={tests} setTests={setTests} />
    </div>
  );
}
