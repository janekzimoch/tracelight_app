"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import TestModal from "./TestModal";
import { Test } from "./SpanRow";

export default function TestCell({
  tests,
  setTests,
  spanId,
}: {
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  spanId: string;
}) {
  async function addTest(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    try {
      console.log(spanId);
      const response = await fetch(`/dashboard/api/tests/span/${spanId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseMessage = await response.json();
        const newTest = {
          id: responseMessage.id,
          description: "",
          executable_code: "",
        } as Test;
        setTests((prevTests) => [...prevTests, newTest]);
      } else {
        console.error("Failed to add test");
      }
    } catch (error) {
      console.error("Error adding test:", error);
    }
  }

  return (
    <div className="flex items-center justify-center text-gray-500">
      <div className="space-y-1 py-4 flex flex-col items-center w-full">
        {tests.map((test, index) => (
          <div key={test.id} className="w-full">
            <TestModal setTests={setTests} testId={test.id} />
          </div>
        ))}
        <Button variant="outline" size="icon" className="rounded-full" onClick={addTest}>
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
