"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TestSampleCard from "./components/TestSampleCard";
import { TestSample } from "./api/testSamples/route";

export default function TestSamples() {
  const [testSamples, setTestSamples] = useState<TestSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    fetchTestSamples();
  }, []);

  async function fetchTestSamples() {
    setIsLoading(true);
    try {
      const response = await fetch("/dashboard/api/testSamples");
      if (response.ok) {
        const data: TestSample[] = await response.json();
        setTestSamples(data);
      } else {
        console.error("Failed to fetch testSamples");
      }
    } catch (error) {
      console.error("Error fetching testSamples:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateMilestone(milestoneId: string, newText: string) {
    try {
      const response = await fetch(`/dashboard/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });

      if (response.ok) {
        await fetchTestSamples();
      } else {
        console.error("Failed to update milestone");
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  }

  async function addMilestone(testSampleId: string, text: string) {
    try {
      const response = await fetch(`/dashboard/api/testSamples/${testSampleId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        await fetchTestSamples(); // Refetch all test samples to update state
      } else {
        console.error("Failed to add milestone");
      }
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  }

  async function deleteMilestone(milestoneId: string) {
    try {
      const response = await fetch(`/dashboard/api/milestones/${milestoneId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTestSamples(); // Refetch all test samples to update state
      } else {
        console.error("Failed to delete milestone");
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  }

  async function runTests() {
    setIsRunningTests(true);
    try {
      const response = await fetch("/dashboard/api/testResults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testSamples }),
      });

      if (response.ok) {
        await fetchTestSamples();
      } else {
        console.error("Failed to run tests");
      }
    } catch (error) {
      console.error("Error running tests:", error);
    } finally {
      setIsRunningTests(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-start h-screen mt-24">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center px-4">
            <div className="mr-8 w-8"></div>
            <div className="flex-1 relative mb-4">
              <div className="grid grid-cols-4 gap-4 text-center text-md text-muted-foreground">
                <h3>User Request</h3>
                <h3>Trace</h3>
                <h3>Milestones</h3>
                <h3>Results</h3>
              </div>
              <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-4 pointer-events-none">
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
                <div className="col-span-1 border-r border-slate-200"></div>
              </div>
            </div>
            <div className="w-10"></div>
          </div>
          {testSamples.map((testSample, index) => (
            <TestSampleCard
              key={testSample.test_sample_id}
              index={index}
              testSample={testSample}
              updateMilestone={updateMilestone}
              addMilestone={(text: string) => addMilestone(testSample.test_sample_id, text)}
              deleteMilestone={deleteMilestone}
            />
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={runTests} disabled={isRunningTests}>
              {isRunningTests ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests
                </>
              ) : (
                "Run Tests"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
