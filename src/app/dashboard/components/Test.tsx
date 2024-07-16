"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import TestModal from "./TestModal";

export default function TestCell({ tests, setTests }: { tests: string[]; setTests: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [openModals, setOpenModals] = useState<boolean[]>(Array(tests.length).fill(false));

  function addTest(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setTests((prevTests) => [...prevTests, "X"]);
  }

  function handleModalOpenChange(index: number, isOpen: boolean) {
    setOpenModals((prevOpenModals) => prevOpenModals.map((open, i) => (i === index ? isOpen : open)));
  }

  return (
    <div className="flex items-center justify-center text-gray-500">
      <div className="space-y-1 py-4 flex flex-col items-center">
        {tests.map((test, index) => (
          <div key={index}>
            <TestModal isOpen={openModals[index]} onOpenChange={(isOpen) => handleModalOpenChange(index, isOpen)} />
          </div>
        ))}
        <Button variant="outline" size="icon" className="rounded-full" onClick={addTest}>
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
