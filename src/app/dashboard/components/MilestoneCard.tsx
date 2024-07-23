import React from "react";

export type Milestones = string[];

export default function MilestoneCard({ milestones, onClick }: { milestones: Milestones; onClick?: () => void }) {
  return (
    <div
      className="border border-solid py-2 px-3 rounded-md shadow hover:shadow-md cursor-pointer max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      onClick={onClick}
    >
      <div className="space-y-1">
        {milestones.map((milestone, index) => (
          <div key={index} className="truncate text-sm  border bg-slate-50 border-solid border-slate-400 px-2 py-[1px] rounded-md">
            {index + 1}. {milestone}
          </div>
        ))}
      </div>
    </div>
  );
}
