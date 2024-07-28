import { v4 as uuidv4 } from "uuid";

interface Node {
  id: string;
  name: string;
  inputs: { input: any };
  outputs: { output: any };
  children: Node[];
}

interface ParsedData {
  user_request: string | null;
  traces: {
    name: string;
    messages: any[];
  }[];
}

function getTraceId(data: any): string {
  return data.runs[data.runs.length - 1].parent_run_id;
}

function extractRuns(data: any, traceId: string): any[] {
  return data.runs.map((run: any) => ({
    id: run.id,
    start_time: run.start_time,
    name: run.name,
    parent_run_id: run.parent_run_id === traceId ? null : run.parent_run_id,
    child_run_ids: run.child_run_ids,
    parent_run_ids: (run.parent_run_ids || []).filter((id: string) => id !== traceId),
    input: run.inputs?.input || null,
    output: run.outputs?.output || null,
  }));
}

function sortRuns(extractedRuns: any[]): any[] {
  return extractedRuns.sort((a, b) => {
    const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
    const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
    return aTime - bTime;
  });
}

function createNodes(data: any[]): { [key: string]: Node } {
  const nodes: { [key: string]: Node } = {};
  data.forEach((item) => {
    const nodeId = item.id;
    const parentId = item.parent_run_id;
    const nodeName = item.name;
    const nodeInput = item.input || "";
    const nodeOutput = item.output || "";

    if (!nodes[nodeId]) {
      nodes[nodeId] = {
        id: nodeId,
        name: nodeName,
        inputs: { input: nodeInput },
        outputs: { output: nodeOutput },
        children: [],
      };
    }

    if (parentId && !nodes[parentId]) {
      nodes[parentId] = {
        id: parentId,
        name: parentId,
        inputs: { input: "" },
        outputs: { output: "" },
        children: [],
      };
    }

    if (parentId) {
      nodes[parentId].children.push(nodes[nodeId]);
    }
  });
  return nodes;
}

function extractContent(item: any): any[] {
  if (item.name === "agent_query_planner") {
    const output = item.outputs.output;
    const content = typeof output === "string" ? output : typeof output === "object" ? output.content || "No content found" : String(output);
    return [{ content, type: "agent_query_planner" }];
  }

  const agentExecutor =
    item.name === "agent_name" ? item : item.children && item.children[0] && item.children[0].name === "AgentExecutor" ? item.children[0] : null;

  if (!agentExecutor) return [];

  const chatPromptTemplate = agentExecutor.children[agentExecutor.children.length - 1].children.find(
    (child: any) => child.name === "ChatPromptTemplate"
  );

  if (!chatPromptTemplate) return [];

  return chatPromptTemplate.outputs.output.messages.map((message: any) => {
    const messageInfo: any = {
      content: message.content,
      type: message.type,
    };

    if (message.type === "ai" && message.additional_kwargs?.function_call) {
      const functionCall = message.additional_kwargs.function_call;
      const args = JSON.parse(functionCall.arguments);
      messageInfo.tool_execution = {
        query: args.query || "No query found",
        tool: functionCall.name,
        arguments: args,
      };
    }

    return messageInfo;
  });
}

function extractFinalOutputNode(item: any): any | null {
  const output = item.outputs.output;
  if (output.type === "AgentFinish") {
    return {
      content: output.return_values.output,
      type: output.type,
    };
  }
  return null;
}

function extractUserRequest(traceTree: any[]): string | null {
  return traceTree[0]?.inputs.input || null;
}

function parseTraceTree(traceTree: any[]): ParsedData {
  const userRequest = extractUserRequest(traceTree);
  const topLevelActions = traceTree.filter(
    (item) => item.name === "agent_query_planner" || (item.children && item.children[0] && item.children[0].name === "AgentExecutor")
  );

  const result = topLevelActions.map((item) => ({
    name: item.name,
    messages: extractContent(item),
  }));

  const finalOutputNode = extractFinalOutputNode(traceTree[traceTree.length - 1]);
  if (finalOutputNode) {
    result.push({
      name: "final_output",
      messages: [finalOutputNode],
    });
  }

  return {
    user_request: userRequest,
    traces: result,
  };
}

export function parseLangSmithTraces(jsonDataList: any[]): ParsedData[] {
  return jsonDataList.map((data) => {
    const traceId = getTraceId(data);
    const extractedRuns = extractRuns(data, traceId);
    const sortedRuns = sortRuns(extractedRuns);
    const nodes = createNodes(sortedRuns);
    const rootNodes = Object.values(nodes).filter((node) => !Object.values(nodes).some((n) => n.children.includes(node)));
    const treeJson = rootNodes.map((node) => node);
    return parseTraceTree(treeJson);
  });
}
