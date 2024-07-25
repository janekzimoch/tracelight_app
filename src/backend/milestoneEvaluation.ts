import { TestResult, TestSample } from "@/app/dashboard/api/testSamples/route";
import { v4 as uuidv4 } from "uuid";

export type TestResultData = {
  trace_id: string;
  milestone_id: string;
  result: TestResult;
};

export async function runTests(testData: TestSample[]) {
  const mockSpanReferences = [
    { agent_span_id: "span1", reference_text: "Reference 1" },
    { agent_span_id: "span2", reference_text: "Reference 2" },
  ];

  const testResults: TestResultData[] = [];
  for (const testSample of testData) {
    for (const milestone of testSample.milestones) {
      const testResultId = uuidv4();
      const result: TestResult = {
        id: testResultId,
        test_title: "Sample Test 1 for Trace 1, Milestone 1",
        feedback_message: "This is a sample feedback message for test 1.",
        pass: false,
        span_references: [],
      };
      for (const ref of mockSpanReferences) {
        const refId = uuidv4();
        result.span_references.push({ id: refId, ...ref });
      }
      testResults.push({
        trace_id: testSample.trace_id,
        milestone_id: milestone.id,
        result,
      });
    }
  }

  return testResults;
}
