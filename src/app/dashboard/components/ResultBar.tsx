import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { TestSample } from "../api/testSamples/route";

export default function ResultBar({ testSample, onClick }: { testSample: TestSample; onClick: () => void }) {
  const { numberPassed, numberTotal } = useMemo(() => {
    const passValues = testSample.milestones.map((m) => m.test_result?.pass).filter((pass): pass is boolean => pass !== undefined);

    return {
      numberTotal: passValues.length,
      numberPassed: passValues.filter(Boolean).length,
    };
  }, [testSample.milestones]);

  // If there are no test results, don't render anything
  if (numberTotal === 0) {
    return null;
  }

  const isAllPassed = numberPassed === numberTotal;
  const baseClasses = "flex cursor-default items-center space-x-2 rounded-full shadow px-3 py-1 hover:shadow-lg cursor-pointer";
  const colorClasses = isAllPassed ? "bg-green-200 text-green-700 border border-green-500" : "bg-red-200 text-red-700 border border-red-500";

  return (
    <Badge className={`${baseClasses} ${colorClasses}`} onClick={onClick}>
      {isAllPassed ? <CheckIcon className="w-4 h-4 text-green-700" /> : <Cross1Icon className="w-4 h-4 text-red-700" />}
      <span>
        {numberPassed}/{numberTotal}
      </span>
    </Badge>
  );
}
