import { Badge } from "@/components/ui/badge";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import React from "react";

export type ResultStatus = {
  numberPassed: number;
  numberTotal: number;
};

export default function ResultBar({ result }: { result: ResultStatus }) {
  const isAllPassed = result.numberPassed === result.numberTotal;
  const baseClasses = "flex items-center space-x-2 rounded-full px-3 py-1 no-hover";
  const colorClasses = isAllPassed ? "bg-green-200 text-green-700 border border-green-500" : "bg-red-200 text-red-700 border border-red-500";

  return (
    <Badge className={`${baseClasses} ${colorClasses}`}>
      {isAllPassed ? <CheckIcon className="w-4 h-4 text-green-700" /> : <Cross1Icon className="w-4 h-4 text-red-700" />}
      <span>
        {result.numberPassed}/{result.numberTotal}
      </span>
    </Badge>
  );
}
