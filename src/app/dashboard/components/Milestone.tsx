import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

export default function MilestoneCell() {
  return (
    <div className="flex items-center justify-center text-gray-500">
      <Button variant="outline" size="icon" className="rounded-full">
        <PlusIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
