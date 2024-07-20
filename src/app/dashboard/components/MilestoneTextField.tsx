import React from "react";

export type Milestones = string[];

export default function MilestoneTextField({ milestones }: { milestones: Milestones }) {
  return (
    <div className="space-y-1 border border-solid py-2 px-6 rounded-2xl hover:bg-slate-100">
      {milestones.map((milestone, index) => (
        <div className="truncate text-sm bg-slate-300 px-2 py-[1px] rounded-xl">
          {index + 1}. {milestone}
        </div>
      ))}
    </div>
  );
}
