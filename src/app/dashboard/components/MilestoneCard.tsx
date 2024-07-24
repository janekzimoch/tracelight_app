import React from "react";
import { Milestone } from "../api/testSamples/route";
import { PlusIcon } from "@radix-ui/react-icons";

export default function MilestoneCard({ milestones, onClick }: { milestones: Milestone[]; onClick?: () => void }) {
  return (
    <div
      className="border border-solid py-2 px-3 rounded-md shadow hover:shadow-md cursor-pointer max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      onClick={onClick}
    >
      <div className="space-y-1">
        {milestones.map((milestone, index) => (
          <div key={index} className="truncate text-sm  border bg-blue-100 border-solid border-blue-400 px-2 py-[1px] rounded-md">
            {index + 1}. {milestone.text}
          </div>
        ))}
        <div className="py-0.5 justify-center flex rounded-lg hover:bg-slate-100">
          <PlusIcon className="text-slate-500" />
        </div>
      </div>
    </div>
  );
}
