"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { TestSample } from "../page";
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import TestSampleDetails from "./TestSampleDetails";

export default function TestSampleCard({ sample, index }: { sample: TestSample; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      key={sample.id}
      className={`relative rounded-lg p-4 space-y-2 transition-all duration-300 ${
        expanded ? "max-h-[600px]" : "max-h-[200px]"
      } overflow-hidden group`} // Add group class for hover effect
    >
      <div className="flex items-center">
        <Avatar className="mr-8 text-slate-500">
          <AvatarFallback>{index + 1}</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-slate-900">{sample.userIntent}</p>
          </div>
          <div>
            <ul className="list-disc list-inside text-sm text-slate-900">
              {sample.subIntents.map((intent, index) => (
                <li key={index}>{intent}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-slate-900 whitespace-pre-line">{sample.trace}</p>
          </div>
          <div>
            <p className="text-sm text-slate-900">{sample.results || ""}</p>
          </div>
          <div>
            <p className="text-sm text-slate-900">{sample.explanation || ""}</p>
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

          <div className="bg-slate-50 shadow-sm rounded-md py-4">
            <div className="overflow-y-auto h-[400px] no-scrollbar ">
              <TestSampleDetails sample={sample} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
