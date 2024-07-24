"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TestSampleCard from "./components/TestSampleCard";
import { ResultStatus } from "./components/ResultBar";
import { Milestones } from "./components/MilestoneCard";
import { FeedbackProps } from "./components/TestSampleExplenations";

export interface MessageSpan {
  id: string;
  sequence_index: number;
  content: string;
  type: string;
  tool_execution: object | null;
}

export interface AgentSpan {
  id: string;
  name: string;
  sequence_index: number;
  messages: MessageSpan[];
}

export interface TestSample {
  test_sample_id: string;
  user_request: string;
  spans: AgentSpan[];
}

const resultMockData: ResultStatus[] = [
  { numberPassed: 5, numberTotal: 5 },
  { numberPassed: 4, numberTotal: 5 },
  { numberPassed: 5, numberTotal: 5 },
  { numberPassed: 4, numberTotal: 5 },
];

const milestonesMockData: Milestones[] = [
  [
    "Make sure emails are under 50 words long.",
    "Planner should plan 4 steps: 1) find user email address, 2) find recipeint email address, 3) fetch relevant data, 4) send email.",
    "email was sent succesfully if we get 200 response from gmail",
    "make sure get_email_address gets called for both user and recipient",
  ],
  [
    "Ensure email subjects are concise and informative.",
    "The planner should execute the following steps: 1) authenticate user, 2) verify recipient details, 3) compose email content, 4) deliver email.",
    "An email is considered sent successfully if a 200 status code is returned by the mail server.",
    "Verify that get_user_email and get_recipient_email functions are executed for both sender and recipient.",
  ],
  [
    "Make sure emails are under 50 words long.",
    "Planner should plan 4 steps: 1) find user email address, 2) find recipeint email address, 3) fetch relevant data, 4) send email.",
    "email was sent succesfully if we get 200 response from gmail",
    "make sure get_email_address gets called for both user and recipient",
  ],
  [
    "Ensure email subjects are concise and informative.",
    "The planner should execute the following steps: 1) authenticate user, 2) verify recipient details, 3) compose email content, 4) deliver email.",
    "An email is considered sent successfully if a 200 status code is returned by the mail server.",
    "Verify that get_user_email and get_recipient_email functions are executed for both sender and recipient.",
  ],
];

const feedbackList: FeedbackProps[] = [
  {
    title: "Send Email",
    message:
      "The sub-request to send an email to John Doe was successfully completed. {ref0} The email lookup returned the correct email address, and the send email function confirmed that the email was sent successfully. {ref1}",
    references: [
      { spanId: "ca9bfb74-db72-4a9c-aa50-34d69acc0116", text: "I successfully" },
      { spanId: "a52092e3-b5ff-4092-99af-032d3aeee445", text: "Send an email" },
    ],
  },
  {
    title: "Fetch Emails",
    message: "The agent successfully retrieved the latest 5 emails sent from 'user123@gmail.com' to 'john@example.com'.",
    references: [],
  },
];

export default function TestSamples() {
  const [testSamples, setTestSamples] = useState<TestSample[]>([]);
  const [milestones, setMilestones] = useState<Milestones[]>(milestonesMockData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTraces() {
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

    fetchTraces();
  }, []);

  const updateMilestone = (index: number, subIndex: number, value: string) => {
    setMilestones((prevMilestones) => {
      const newMilestones = [...prevMilestones];
      newMilestones[index][subIndex] = value;
      return newMilestones;
    });
  };

  const addMilestone = (index: number, value: string) => {
    setMilestones((prevMilestones) => {
      const newMilestones = [...prevMilestones];
      newMilestones[index] = [...newMilestones[index], value];
      return newMilestones;
    });
  };

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
                <h3>Traces</h3>
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
              testSample={testSample}
              index={index}
              result={resultMockData[index]}
              milestones={milestones[index]}
              updateMilestone={(subIndex: number, value: string) => updateMilestone(index, subIndex, value)}
              addMilestone={(value: string) => addMilestone(index, value)}
              feedback={feedbackList}
            />
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex justify-center mt-4">
            <Button variant="outline">Run Tests</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
